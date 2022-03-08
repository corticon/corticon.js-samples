# Rules Based Dynamic Forms

## Introduction

These forms are sometimes called Dynamic Questionnaire.  They are used in situation where there are multiple paths in 
the flow of questions to ask the user and there typically are many questions.

They are rendered by a generic client side component (CSC)
following the instructions from a set of rules embedded in a decision service (DS).

The CSC does not know the questions to be asked at each step and what the answers mean but it knows 
how to render these questions and collect the answers. 

The DS driving the dynamic forms, specify what the questions, the constraints on questions and where to store the 
answers.  The DS do not know the current state of the questionnaire but know what to do at each step.

## Design

