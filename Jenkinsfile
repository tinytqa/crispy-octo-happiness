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
  } // end stagess
}//end pipeline