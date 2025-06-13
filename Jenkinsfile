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
        Import-Module WebAdministration

        # Tên site muốn deploy
        $siteName = "MySite"

        # Đường dẫn publish
        $path = "C:\\wwwroot\\myproject_testcd"

        # Port mong muốn
        $port = 82

        # Xóa site nếu đã tồn tại
        if (Test-Path "IIS:\\Sites\\$siteName") {
            Remove-Website -Name $siteName
        }

        # Tạo site mới
        New-Website -Name $siteName -Port $port -PhysicalPath $path -Force
        '''
    }
}


  } // end stagess
}//end pipeline