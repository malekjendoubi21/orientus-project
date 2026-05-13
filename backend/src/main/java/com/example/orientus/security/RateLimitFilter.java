package com.example.orientus.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Duration WINDOW = Duration.ofMinutes(1);
    private static final String CHATBOT_PREFIX = "/api/chatbot";
    private static final String RECOMMENDATIONS_PREFIX = "/api/recommendations";

    private final Map<String, RequestWindow> windows = new ConcurrentHashMap<>();

    @Value("${app.rate-limit.chatbot-per-minute:30}")
    private int chatbotRequestsPerMinute;

    @Value("${app.rate-limit.recommendations-per-minute:20}")
    private int recommendationRequestsPerMinute;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String requestPath = request.getRequestURI();
        int limit = getLimitForPath(requestPath);
        if (limit <= 0) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = resolveClientKey(request, requestPath);
        RequestWindow currentWindow = windows.computeIfAbsent(clientKey, ignored -> new RequestWindow());
        if (!currentWindow.tryConsume(limit)) {
            log.warn("Rate limit reached for key={} on path={}", clientKey, requestPath);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests. Please retry in a minute.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private int getLimitForPath(String requestPath) {
        if (requestPath.startsWith(CHATBOT_PREFIX)) {
            return chatbotRequestsPerMinute;
        }
        if (requestPath.startsWith(RECOMMENDATIONS_PREFIX)) {
            return recommendationRequestsPerMinute;
        }
        return -1;
    }

    private String resolveClientKey(HttpServletRequest request, String path) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() != null) {
            return "user:" + authentication.getName() + "|path:" + getPathGroup(path);
        }
        return "ip:" + request.getRemoteAddr() + "|path:" + getPathGroup(path);
    }

    private String getPathGroup(String path) {
        if (path.startsWith(CHATBOT_PREFIX)) {
            return CHATBOT_PREFIX;
        }
        return RECOMMENDATIONS_PREFIX;
    }

    private static final class RequestWindow {
        private volatile Instant windowStart = Instant.now();
        private final AtomicInteger count = new AtomicInteger(0);

        synchronized boolean tryConsume(int limit) {
            Instant now = Instant.now();
            if (Duration.between(windowStart, now).compareTo(WINDOW) >= 0) {
                windowStart = now;
                count.set(0);
            }
            return count.incrementAndGet() <= limit;
        }
    }
}
