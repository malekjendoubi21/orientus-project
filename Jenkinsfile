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

    REPO_URL = 'https://github.com/malekjendoubi21/orientus-project.git'

    SSH_CREDENTIALS_ID = 'orientus-ssh'

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
        steps {

            sh 'docker build -t orientus-backend:latest ./backend'

            sh 'docker build -t orientus-frontend:latest ./frontend'

            sh 'docker build -t orientus-ml:latest ./ml'
        }
    }

    stage('Deploy') {
        steps {

            sshagent(credentials: [env.SSH_CREDENTIALS_ID]) {

                sh """
                ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << 'EOF'

                set -e

                if [ ! -d "${DEPLOY_DIR}/.git" ]; then
                    git clone "${REPO_URL}" "${DEPLOY_DIR}"
                fi

                cd "${DEPLOY_DIR}"

                git fetch --all

                git checkout ${DEPLOY_BRANCH}

                git pull origin ${DEPLOY_BRANCH}

                docker compose down

                docker compose up -d --build --remove-orphans

                docker image prune -af

                docker system prune -f

                docker ps

                EOF
                """
            }
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
