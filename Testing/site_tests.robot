*** Settings ***
Library    SeleniumLibrary
Suite Setup    Set Selenium Speed    0.2s
Suite Teardown    Close All Browsers

*** Variables ***
${BASE_URL}       http://localhost:3000
${BROWSER}        edge
${VALID_USER}     t
${VALID_PASS}     t
${INVALID_USER}   eitoimi
${INVALID_PASS}   eitoimi
${NEW_USER}       newuser
${NEW_PASS}       newpassword
${TIMEOUT}        2s

*** Test Cases ***

Login - Successful
    Open Login Page
    Input Credentials    ${VALID_USER}    ${VALID_PASS}
    Submit Login
    Wait Until Page Contains    Welcome, ${VALID_USER}!    ${TIMEOUT}

Login - Invalid Credentials Shows Alert
    Open Login Page
    Input Credentials    ${INVALID_USER}    ${INVALID_PASS}
    Submit Login
    ${msg}=    Wait Until Keyword Succeeds    5x    1s    Handle Alert
    Should Contain    ${msg}    Invalid

Register - New User
    Open Browser    ${BASE_URL}/register    ${BROWSER}
    Handle Certificate If Present
    Wait Until Page Contains Element    id=register_button    ${TIMEOUT}
    Page Should Contain Element    id=register_button
    Input Text    id=user_name    ${NEW_USER}
    Input Text    id=user_pass    ${NEW_PASS}
    Click Button    id=register_button
    Wait Until Page Contains    Welcome, ${NEW_USER}!    ${TIMEOUT}
    Click Button    id=delete_account
    Wait Until Page Contains    Login    ${TIMEOUT}

Dashboard - Navigate To Todo
    Open Login Page
    Input Credentials    ${VALID_USER}    ${VALID_PASS}
    Submit Login
    Wait Until Page Contains    Welcome, ${VALID_USER}!    ${TIMEOUT}
    Click Button    id=todo_app
    Wait Until Page Contains    Todo App    ${TIMEOUT}

Todo - Add And Delete Task
    Open Login Page
    Input Credentials    ${VALID_USER}    ${VALID_PASS}
    Submit Login
    Click Button    id=todo_app
    Input Text    name=task    My First Task
    Click Button    id=add_button
    Wait Until Page Contains    My First Task    ${TIMEOUT}
    Click Button    id=delete_63
    Wait Until Page Does Not Contain    My First Task    ${TIMEOUT}

Logout - Session Ends
    Open Login Page
    Input Credentials    ${VALID_USER}    ${VALID_PASS}
    Submit Login
    Click Element    id=logout
    Wait Until Page Contains    Login    ${TIMEOUT}


*** Keywords ***



Open Login Page
    Open Browser    ${BASE_URL}    ${BROWSER}
    Handle Certificate If Present
    Wait Until Page Contains Element    id=login_button    ${TIMEOUT}

Handle Certificate If Present
    Run Keyword And Ignore Error    Click Element    id=details-button
    Run Keyword And Ignore Error    Click Element    id=proceed-link

Input Credentials
    [Arguments]    ${user}    ${pass}
    Input Text    id=user_name    ${user}
    Input Text    id=user_pass    ${pass}

Submit Login
    Click Button    id=login_button

Assert Invalid Login Alert
    ${msg}=    Wait Until Keyword Succeeds    5x    1s    Handle Alert
    Should Contain    ${msg}    Invalid
