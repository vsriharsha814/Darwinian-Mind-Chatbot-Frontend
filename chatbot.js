// Get chatbot elements
let uploadedFiles = [];
const actionUrl = '/ms/chatbotaction/pages';
// const actionUrl = '/pages';
const chatbot = document.getElementById('chatbot');
const conversation = document.getElementById('conversation');
const inputForm = document.getElementById('input-form');
const inputField = document.getElementById('input-field');

function setFields() {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
        const emailInput = document.getElementById('user-email');
        emailInput.value = storedEmail; // Populate the email input box with the stored email
    }

    getBotSettingsFromParameters();
}

// Add event listener to input form
inputForm.addEventListener('submit', async function (event) {
    // Prevent form submission
    event.preventDefault();

    // Get user input
    const input = inputField.value;

    if (inputField.value === '') {
        return;
    }

    // Clear input field
    inputField.value = '';
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" });

    // Add user input to conversation
    if (sendUserMessageCheck) {
        let message = document.createElement('div');
        message.classList.add('chatbot-message', 'user-message');
        message.innerHTML = `<p class="chatbot-text" sentTime="${currentTime}">${input}</p>`;
        conversation.appendChild(message);
        message.scrollIntoView({ behavior: "smooth" });
    }

    // Generate chatbot response
    const response = await generateResponse(input);

    if (response) {
        // Add chatbot response to conversation
        message = document.createElement('div');
        message.classList.add('chatbot-message', 'chatbot');
        message.innerHTML = `<p class="chatbot-text" sentTime="${currentTime}">${response}</p>`;
        conversation.appendChild(message);
        message.scrollIntoView({ behavior: "smooth" });
    }
});

// Generate chatbot response function
async function generateResponse(input) {
    console.log('this is the input ands we will be generating a response from here:', input);
    showTypingIndicator();

    const emailInput = document.getElementById('user-email');
    const userEmail = emailInput.value.trim();

    if (!userEmail) {
        // If the email input is empty, show an error popup
        alert("Please enter your email address first.");
        return Promise.resolve();
    }

    localStorage.setItem('userEmail', userEmail);

    try {
        const response = await $.ajax({
            url: actionUrl + '/mlTestPoliciesQuery',
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                query: input,
                email: userEmail,
                apiUrl: window.location.origin,
            }),
        });

        hideTypingIndicator();

        if (response.answer) {
            return response.answer;
        }

        if (response.Intent) {
            // T0-D0 in future
        }
        return Promise.resolve(); // Resolve with an empty value if no response or intent is found.
    } catch (error) {
        // Handle the error here and show the error message
        const errorMessage = "Sorry, something went wrong with the server."
        // showError(errorMessage);
        console.log(error);
        hideTypingIndicator();
        return errorMessage; // Resolve with an empty value in case of an error.
    }
}

// Function to show the typing indicator
function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.classList.add('chatbot-message', 'chat-bot-typing');

    const typingDots = document.createElement('p');
    typingDots.classList.add('chatbot-text');
    for (let i = 0; i < 4; i++) {
        const dot = document.createElement('span');
        typingDots.appendChild(dot);
    }

    typingIndicator.appendChild(typingDots);
    conversation.appendChild(typingIndicator);
    typingIndicator.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// Function to hide the typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Updated function to handle file upload and show the uploaded file names
function handleFileUpload() {
    const uploadInput = document.getElementById('upload');
    const uploadedFileList = document.querySelector('.uploaded-file-list');

    uploadInput.addEventListener('change', function () {
        const files = uploadInput.files;

        if (uploadedFiles.length + files.length <= 5) {
            for (const file of files) {
                uploadedFiles.push(file);
            }

            if (uploadedFiles.length > 0) {
                uploadedFileList.style.display = 'block';

                // Clear any existing file name elements
                uploadedFileList.innerHTML = '';

                // Add each file name as a separate list item
                for (let i = 0; i < uploadedFiles.length && i < 5; i++) {
                    const listContainer = document.createElement('li');
                    listContainer.style.display = 'flex';

                    const listItem = document.createElement('div');
                    listItem.innerHTML = uploadedFiles[i].name;
                    listItem.classList.add('uploaded-file-names');

                    const deleteButton = document.createElement('span');
                    deleteButton.innerHTML = '&#10006;';
                    deleteButton.classList.add('delete-uploaded-file');
                    deleteButton.setAttribute('data-index', i);
                    deleteButton.addEventListener('click', function () {
                        deleteUploadedFile(i);
                    });

                    listContainer.appendChild(listItem);
                    listContainer.appendChild(deleteButton);
                    uploadedFileList.appendChild(listContainer);
                }
            } else {
                uploadedFileList.style.display = 'none';
            }

            // Disable the upload button if 5 files are uploaded
            if (uploadedFiles.length >= 5) {
                uploadInput.disabled = true;
                document.getElementById('upload-label').innerText = "Maximum files uploaded";
            }

            renderFileList();
        } else {
            // Prevent uploading more than 5 files
            alert("You can upload up to 5 files only.");
            uploadInput.value = '';
        }
    });
}

function renderFileList() {
    const uploadedFileList = document.querySelector('.uploaded-file-list');

    if (uploadedFiles.length > 0) {
        uploadedFileList.style.display = 'block';

        // Clear any existing file name elements
        uploadedFileList.innerHTML = '';

        // Add each file name as a separate list item
        for (let i = 0; i < uploadedFiles.length && i < 5; i++) {
            const listContainer = document.createElement('li');
            listContainer.style.display = 'flex';

            const listItem = document.createElement('div');
            listItem.innerHTML = uploadedFiles[i].name;
            listItem.classList.add('uploaded-file-names');

            const deleteButton = document.createElement('span');
            deleteButton.innerHTML = '&#10006;';
            deleteButton.classList.add('delete-uploaded-file');
            deleteButton.setAttribute('data-index', i);

            // Attach the event listener to the delete button
            deleteButton.addEventListener('click', function () {
                deleteUploadedFile(i);
            });

            listContainer.appendChild(listItem);
            listContainer.appendChild(deleteButton);
            uploadedFileList.appendChild(listContainer);
        }
    } else {
        uploadedFileList.style.display = 'none';
    }
}

function deleteUploadedFile(index) {
    const uploadInput = document.getElementById('upload');

    // Remove the file at the specified index
    uploadedFiles.splice(index, 1);

    // Enable the upload button when a file is deleted
    uploadInput.disabled = false;
    document.getElementById('upload-label').innerText = "Upload Policy Files (up to 5 files)";

    // Re-render the file list
    renderFileList();
}

function userEmailCheck() {
    const emailInput = document.getElementById('user-email');
    const userEmail = emailInput.value.trim();

    if (!userEmail) {
        return false;
    }
    return true;
}

function sendUserMessageCheck() {
    return userEmailCheck();
}

function showError(message = "Something went wrong") {
    var errorMessage = document.getElementById("error-message");
    errorMessage.innerHTML = message;
    errorMessage.style.display = "block";
}

function hideError(message = "Something went wrong") {
    var errorMessage = document.getElementById("error-message");
    errorMessage.innerHTML = message;
    errorMessage.style.display = "none";
}

function sendMessageAsBot(response) {
    // Generate chatbot response
    const input = ''; // You can set the input to an empty string or any other default value
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit" });

    // Add chatbot response to conversation
    const message = document.createElement('div');
    message.classList.add('chatbot-message', 'chatbot');
    message.innerHTML = `<p class="chatbot-text" sentTime="${currentTime}">${response}</p>`;
    conversation.appendChild(message);
    message.scrollIntoView({ behavior: "smooth" });
}

function createChatbotFromUploadedFiles() {
    const uploadInput = document.getElementById('upload');
    const formData = new FormData();
    const loader = document.getElementById('loader'); // Get the loader element

    if (uploadedFiles.length === 0) {
        alert("Please upload at least one file.");
        return;
    }

    // Append each uploaded file to the FormData object
    for (const file of uploadedFiles) {
        formData.append('files', file);
    }

    // Show the loader before making the AJAX request
    loader.style.display = 'block';

    // Make the AJAX request with the FormData
    $.ajax({
        url: actionUrl + '/mlTestPoliciesUpload',
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            // Handle the successful response here
            console.log("Chatbot response:", response);
            sendMessageAsBot(response.message);

            // Hide the loader after the request is complete
            loader.style.display = 'none';

            // Reset uploaded files and clear the file input field
            uploadedFiles = [];
            uploadInput.value = '';
            renderFileList();
        },
        error: function (error) {
            // Handle the error here and show the error message
            const errorMessage = "Sorry, something went wrong with the server.";
            console.log(error);
            showError(errorMessage);

            // Hide the loader after the request is complete (even in case of an error)
            loader.style.display = 'none';
        }
    });
}


function updateBotSettingsFromParameters() {
    const specificityInput = document.getElementById('specificity');
    const lengthInput = document.getElementById('length');
    const instructionsInput = document.getElementById('instructions');

    const settingsData = {
        temperature: specificityInput.value / 10,
        max_tokens: lengthInput.value,
        prompt: instructionsInput.value + '\r\n\r\ncontext:\r\n!@#$%^&*()',
        type: 'putRequest'
    };

    $.ajax({
        url: actionUrl + '/mlTestPoliciesSettings',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(settingsData),
        success: function (response) {
            sendMessageAsBot('Settings updated successfully.');
        },
        error: function (error) {
            // Handle the error here and show the error message
            console.log(error);
            sendMessageAsBot('Failed to update bot settings.');
        }
    });
}

function getBotSettingsFromParameters() {
    $.ajax({
        url: actionUrl + '/mlTestPoliciesSettings',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ type: 'getRequest'}),
        success: function (response) {
            // Update the UI with the retrieved settings
            const specificityInput = document.getElementById('specificity');
            const lengthInput = document.getElementById('length');
            const instructionsInput = document.getElementById('instructions');

            specificityInput.value = response.temperature * 10;
            lengthInput.value = response.max_tokens;
            const searchString = '\r\n\r\ncontext:\r\n!@#$%^&*()';
            instructionsInput.value = response.prompt.split(searchString).join('');
        },
        error: function (error) {
            // Handle the error here and show the error message
            console.log(error);
            showError('Failed to get bot settings.');
        }
    });
}

handleFileUpload();
setFields();
