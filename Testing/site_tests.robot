*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${BASE_URL}       https://localhost:3000
${BROWSER}        chrome
${VALID_USER}     t
${VALID_PASS}     t
${INVALID_USER}   eitoimi
${INVALID_PASS}   eitoimi
${NEW_USER}       newuser
${NEW_PASS}       newpassword

*** Test Cases ***

Login Page - Successful Login
    Open Browser    ${BASE_URL}    ${BROWSER}
    Click Button    id=details-button
    Click Link      id=proceed-link
    Input Text    id=user_name    ${VALID_USER}
    Input Text    id=user_pass    ${VALID_PASS}
    Click Button    id=login_button
    Wait Until Page Contains    Welcome, ${VALID_USER}!
    Close Browser

Login Page - Invalid Login
    Open Browser    ${BASE_URL}    ${BROWSER}
    Click Button    id=details-button
    Click Link      id=proceed-link
    Input Text    id=user_name    ${INVALID_USER}
    Input Text    id=user_pass    ${INVALID_PASS}
    Click Button    id=login_button
    Alert Should Be Present
    ${alert_text}=    Get Alert Message
    Should Contain    ${alert_text}    Invalid credentials
    Handle Alert
    Close Browser

Register Page - Successful Registration
    Open Browser    ${BASE_URL}/register    ${BROWSER}
    Click Button    id=details-button
    Click Link      id=proceed-link
    Input Text    id=user_name    ${NEW_USER}
    Input Text    id=user_pass    ${NEW_PASS}
    Click Button    css=button[type="submit"]
    Wait Until Page Contains    Welcome, ${NEW_USER}!
    Click Button    id=delete_account
    Close Browser

Dashboard - Access Todo App
    Open Browser    ${BASE_URL}    ${BROWSER}
    Click Button    id=details-button
    Click Link      id=proceed-link
    Input Text    id=user_name    ${VALID_USER}
    Input Text    id=user_pass    ${VALID_PASS}
    Click Button    id=login_button
    Wait Until Page Contains    Welcome, ${VALID_USER}!
    Click Button    id=todo_app
    Wait Until Page Contains    Todo App
    Close Browser

Todo App - Add and Delete Task
    Open Browser    ${BASE_URL}    ${BROWSER}
    Click Button    id=details-button
    Click Link      id=proceed-link
    Input Text    id=user_name    ${VALID_USER}
    Input Text    id=user_pass    ${VALID_PASS}
    Click Button    id=login_button
    Click Button    id=todo_app
    Input Text    name=task    My First Task
    Click Button    id="todo_add"
    Wait Until Page Contains    My First Task
    Click Button    id="delete_todo"
    Wait Until Page Does Not Contain    My First Task
    Close Browser
