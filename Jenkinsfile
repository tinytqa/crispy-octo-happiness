pipeline {
 agent any
 
 stages {
	stage('clone'){
		steps {
			echo 'Cloning source code'
			git branch:'main', url: 'https://github.com/tinytqa/crispy-octo-happiness'
		}
	} // end clone
    stage('restore package') {
		steps
		{
			echo 'Restore package'
			bat 'dotnet restore "C:/Users/tranq/OneDrive/Documents/GitHub/crispy-octo-happiness/Final_Project5/Final_Project5.sln"'
		}
	}
    stage ('build') {
		steps {
			echo 'build project netcore'
			bat 'dotnet build "C:/Users/tranq/OneDrive/Documents/GitHub/crispy-octo-happiness/Final_Project5/Final_Project5.sln" --configuration Release'
		}
	}
    stage ('tests') {
		steps{
			echo 'running test...'
			bat 'dotnet test "C:/Users/tranq/OneDrive/Documents/GitHub/crispy-octo-happiness/Final_Project5/Final_Project5.sln" --no-build --verbosity normal'
		}
	}
    stage ('public den t thu muc')
	{
		steps{
			echo 'Publishing...'
			bat 'dotnet publish "C:/Users/tranq/OneDrive/Documents/GitHub/crispy-octo-happiness/Final_Project5/Final_Project5.sln" -c Release -o ./publish'
		}
	}
    stage ('Publish to IIS') {
	steps {
		echo 'Stopping IIS...'
		bat 'iisreset /stop'

		echo 'Deploying to IIS folder...'
		bat 'xcopy "%WORKSPACE%\\publish\\*" "C:\\wwwroot\\myproject_testcd\\" /E /Y /I /R'

		echo 'Starting IIS...'
		bat 'iisreset /start'
	}
}
    stage('Deploy to IIS') {
            steps {
                powershell '''
               
                # Tạo website nếu chưa có
                Import-Module WebAdministration
                if (-not (Test-Path IIS:\\Sites\\MySite)) {
                    New-Website -Name "MySite" -Port 83 -PhysicalPath "C:\\wwwroot\\myproject_testcd\\"
                }  
                '''
            }
        } // end deploy iis

  } // end stagess
}//end pipeline