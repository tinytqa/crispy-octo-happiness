pipeline {
 agent any
 
 stages {
	stage('clone'){
		steps {
			echo 'Cloning source code'
			git branch:'main', url: 'https://github.com/tinytqa/crispy-octo-happiness'
		}
	} // end clone

  } // end stagess
}//end pipeline