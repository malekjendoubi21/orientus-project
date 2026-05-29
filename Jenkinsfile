pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    DEPLOY_HOST = '152.239.113.215'
    DEPLOY_USER = 'ubuntu'
    DEPLOY_DIR = '/opt/orientus'
    DEPLOY_BRANCH = 'main'
    REPO_URL = 'CHANGE_ME_REPO_URL'
    SSH_CREDENTIALS_ID = 'orientus-ssh'
    DOCKER_BUILDKIT = '1'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        dir('backend') {
          sh './mvnw -B -DskipTests package'
        }
        dir('frontend') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Test') {
      steps {
        dir('backend') {
          sh './mvnw -B test'
        }
        dir('frontend') {
          sh 'npm run lint'
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t orientus-backend:latest ./backend'
        sh 'docker build -t orientus-frontend:latest ./frontend'
        sh 'docker build -t orientus-ml:latest ./ml'
      }
    }

    stage('Deploy') {
      steps {
        sshagent(credentials: [env.SSH_CREDENTIALS_ID]) {
          sh '''
            ssh -o StrictHostKeyChecking=no "$DEPLOY_USER@$DEPLOY_HOST" << EOF
            set -e
            if [ ! -d "${DEPLOY_DIR}/.git" ]; then
              git clone "${REPO_URL}" "${DEPLOY_DIR}"
            fi
            cd "${DEPLOY_DIR}"
            git fetch --all
            git checkout "${DEPLOY_BRANCH}"
            git pull --ff-only
            docker compose -f docker-compose.yml up -d --build --remove-orphans
            docker image prune -f
            EOF
          '''
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
