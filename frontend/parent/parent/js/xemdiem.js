/**
 * Academic Grade Table JavaScript
 * 
 * This script provides the interactive functionality for the grade table application,
 * including tab switching and close button operation.
 */

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    
    /**
     * Tab Switching Functionality
     * 
     * This section handles the switching between different tab views
     * (Semester 1, Semester 2, and Yearly Summary)
     */
    
    // Select all tab elements
    const tabs = document.querySelectorAll('.tab');
    
    // Select all tab content containers
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Add click event listeners to each tab
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and content sections
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to the clicked tab
            tab.classList.add('active');
            
            // Get the corresponding content ID from the data-tab attribute
            const tabId = tab.getAttribute('data-tab');
            
            // Add active class to the corresponding content section
            document.getElementById(tabId).classList.add('active');
        });
    });
    

  
});