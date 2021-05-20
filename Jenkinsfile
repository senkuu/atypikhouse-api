pipeline {
    agent { docker { image 'node:12-alpine' } }
    environment {
        CI = 'true' 
    }
    stages {
        stage('Build') {
            steps {
                sh 'yarn --frozen-lockfile'
            }
        }
        stage('Test') {
          steps {
            sh 'yarn run test'
          }
        }
    }
}
