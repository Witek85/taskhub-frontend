
pipeline {
    agent any

    tools {
        nodejs 'node24'
    }

    environment {
        VPS_HOST = '51.83.154.177'
        VPS_USER = 'ubuntu'
        DEPLOY_DIR = '/var/www/taskhub'
        OPENAPI_URL = 'https://taskhub.itreallyworks.pl/v3/api-docs'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm

                script {
                    if (env.BRANCH_NAME && env.BRANCH_NAME != 'main') {
                        error('Production deployment is allowed only from main.')
                    }
                    if (sh(
                        script: 'git branch --show-current',
                        returnStdout: true
                    ).trim() != 'HEAD') {
                        // Jenkins commonly uses detached HEAD.
                        echo 'Checking deployed commit.'
                    }
                    sh 'git log -1 --oneline'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Download OpenAPI') {
            steps {
                sh '''
                    node openapi/scripts/download-spec.mjs \
                      "$OPENAPI_URL" \
                      openapi/taskhub-service/openapi.json
                '''
            }
        }

        stage('Generate OpenAPI Client') {
            steps {
                sh '''
                    npm run openapi:taskhub:clean
                    npm run openapi:taskhub:generate
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy Frontend') {
            steps {
                sshagent(credentials: ['taskhub-vps-ssh']) {
                    sh '''
                        set -e

                        tar -czf /tmp/taskhub-frontend.tar.gz \
                            -C dist/frontend/browser .

                        scp -o StrictHostKeyChecking=accept-new \
                            /tmp/taskhub-frontend.tar.gz \
                            "$VPS_USER@$VPS_HOST:/tmp/taskhub-frontend.tar.gz"

                        ssh -o StrictHostKeyChecking=accept-new \
                            "$VPS_USER@$VPS_HOST" '
                                set -e

                                mkdir -p /tmp/taskhub-frontend-deploy
                                rm -rf /tmp/taskhub-frontend-deploy
                                mkdir -p /tmp/taskhub-frontend-deploy

                                tar -xzf /tmp/taskhub-frontend.tar.gz \
                                    -C /tmp/taskhub-frontend-deploy

                                test -f /tmp/taskhub-frontend-deploy/index.html

                                sudo find /var/www/taskhub \
                                    -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +

                                sudo cp -a /tmp/taskhub-frontend-deploy/. \
                                    /var/www/taskhub/

                                sudo chmod -R a+rX /var/www/taskhub

                                sudo nginx -t
                            '
                    '''
                }
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    for i in $(seq 1 10); do
                        if node -e "fetch('https://taskhub.itreallyworks.pl/tasks').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"; then
                            echo "Frontend smoke test passed."
                            exit 0
                        fi

                        sleep 3
                    done

                    echo "Frontend smoke test failed."
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            archiveArtifacts(
                artifacts: 'dist/frontend/browser/**',
                fingerprint: true
            )

            echo 'TaskHub frontend pipeline successful.'
        }

        failure {
            echo 'TaskHub frontend pipeline failed.'
        }
    }
}
