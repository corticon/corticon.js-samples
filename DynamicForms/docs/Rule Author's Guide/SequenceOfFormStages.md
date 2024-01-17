# Sequence Of Form Stages

The mechanism through which we identify when to render a given prompt  to the end user is the stageNumber.

Dynamic forms do not progress linearly—
every time content is rendered to the form end user, that content is rendered because the stage specified by the Client has been matched with a rulesheet that filters out all stages except the one specified. 

The rules will tell the front end what to present at each stage, as well as what the stage number should be set to the next time the user hits 'next'.

