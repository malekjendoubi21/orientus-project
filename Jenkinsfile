pipeline {
agent any

parameters {
    booleanParam(name: 'LOCAL_DOCKER_BUILD', defaultValue: false, description: 'Build images on the Jenkins agent (requires Docker access).')
}

options {
    timestamps()
}

environment {
    DOCKER_BUILDKIT = '1'
}

stages {

    stage('Checkout') {
        steps {
            checkout scm
        }
    }

    stage('Build Backend') {
        steps {
            dir('backend') {
                sh 'chmod +x mvnw'
                sh './mvnw -B clean package -DskipTests'
            }
        }
    }

    stage('Build Frontend') {
        steps {
            dir('frontend') {
                sh 'npm ci'
                sh 'npm run build'
            }
        }
    }

   

   

    stage('Verify Docker Compose') {
        steps {
            sh 'docker compose config'
        }
    }

    stage('Docker Build') {
        when {
            expression { return params.LOCAL_DOCKER_BUILD }
        }
        steps {

            sh 'docker build -t orientus-backend:latest ./backend'

            sh 'docker build -t orientus-frontend:latest ./frontend'

            sh 'docker build -t orientus-ml:latest ./ml'
        }
    }

    stage('Deploy') {
        steps {
            sh 'docker compose down'
            sh 'docker compose up -d --build --remove-orphans'
            sh 'docker image prune -af'
            sh 'docker system prune -f'
            sh 'docker ps'
        }
    }
}

post {

    success {
        echo 'Deployment completed successfully.'
    }

    failure {
        echo 'Pipeline failed.'
    }

    always {
        cleanWs()
    }
}
}
