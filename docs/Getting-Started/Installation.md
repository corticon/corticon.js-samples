# Corticon.js Installation

## Brand New Users

*   Sign up using the 'Try Now' link at [this page](https://www.progress.com/corticon-js)
*   Download and install using default installation settings

## Users with an Active Corticon.js License

*   Access Corticon.js Studio installer by clicking Corticon at [this page](https://www.progress.com/support/download-center)

Questions? Consult the [installation documentation](https://docs.progress.com/bundle/corticon-js-introduction/page/Install-Corticon.js-Studio.html) from the official Corticon documentation site.

# Setting up your environment

When we build the dynamic form rules, we're ultimately going to be transpiling the rules into a self-contained JavaScript bundle. In simpler terms, all of the logic will be encapsulated into just one file decisionServiceBundle.js. 

Front end developers handle the 'rendering side' of the form. This includes defining data that will be passed in at the onset of the form, styling, and where the data goes once the form is filled out. 

To make everyone's life easier, we provide  open source implementations of Corticon.js Dynamic Forms which you can freely download, import into your environment, and adapt to your needs. This includes both sample rule assets that you can work with in Corticon.js Studio, and a sample client side rendering component. 

## Accessing the samples repository

There are many tools out there for working with git repositories; here we'll outline one approach from the standpoint of someone with little to no development experience.

Access the Sample Rule Assets in Corticon.js Studio:

1. Create a user account on [Github.com](github.com)
2. [Download Github Desktop](https://desktop.github.com/) and [install](https://docs.github.com/en/desktop) with default settings. Authorize the application with your Github login. 
3. From [this link](https://github.com/corticon/corticon.js-samples), click the green "Code" button, then 'Open with GitHub Desktop'
4. If desired, change the default 'Local path'
5. Click 'Clone'
6. Open Corticon.js Studio
7. Click File > Import > Expand out 'Git' > Projects from Git then click next
8. Select 'Existing local repository' then click next
9. Navigate to where the repository was cloned then click next
10. Click 'Import as general project'
11. Click on the folder 'Dynamic Forms' under 'Working Tree' then click next
12.  Hit finish