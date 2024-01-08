// Add custom JavaScript here
var siteContent = {
    'headerTitle': 'CoolieTech',
    'toolsTab': 'Tools',
    'servicesTab': 'Services',
    'aboutTab': 'About',
    'contactTab': 'Contact'
};

const services = [
    { title: "Web Scraping", description: "Information about Web Scraping service." },
    { title: "Automation", description: "Details about Data Analysis services." },
    { title: "List Building", description: "Learn about our API Development offerings." },
    { title: "Web Development", description: "Insights into Machine Learning services." }
];

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('headerTitle').textContent = siteContent['headerTitle'];
    // similarly, update other elements
});

function populateAccordion() {
    const accordion = document.getElementById('servicesAccordion');
    if (window.location.href.includes('index.html')) {
        services.forEach((service, index) => {
            accordion.innerHTML += `
                <div class="card">
                    <div class="card-header card-click" id="heading${index}" data-toggle="collapse" data-target="#collapse${index}" aria-expanded="${index === 0}" aria-controls="collapse${index}">
                        <h5 class="mb-0 card-click" data-toggle="collapse" data-target="#collapse${index}" aria-expanded="${index === 0}" aria-controls="collapse${index}">
                            <button style="font-size:18px;" class="btn btn-link card-click" data-toggle="collapse" data-target="#collapse${index}" aria-expanded="${index === 0}" aria-controls="collapse${index}">
                                ${service.title} <span class="accordion-icon" style="font-size:20px;">+</span>
                            </button>
                        </h5>
                    </div>
                    <div id="collapse${index}" class="collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading${index}" data-parent="#servicesAccordion">
                        <div class="card-body" style="color:black;">
                            ${service.description}
                        </div>
                    </div>
                </div>
            `;
        });
    }
}

// Tutorial steps

function startTutorial() {
    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = 'overlay';
    document.body.appendChild(overlay);

    // Text Box
    const textBox = document.createElement('div');
    textBox.className = 'info-box';
    textBox.id = 'info-box';
    textBox.textContent = 'Welcome to the tutorial!'; // Initial text
    document.body.appendChild(textBox);

    const features = ['feature-1', 'feature-2','feature-3']; // Class names of groups of elements to highlight
    const featureTexts = 
    [`<p>Let's test the WebWatcher on your site. It works by looking for distinct text on your homepage.</p><p>If it finds the text, your site is up.</p><p>If not, your site may be down and you'll receive an alert.</p><p class='custom-bullet'><b>STEP 1</b> <span class='bullet-symbol'>&bull; </span>Enter the domain you want to monitor in the highlighted textbox. Use the format 'yoursite.com'</p>`, 
    `<p class='custom-bullet'><b>STEP 2</b> <span class='bullet-symbol'>&bull; </span>Use the website preview window or open your site in a new tab to copy some distinct text from your homepage. <u>Only copy text from the homepage.</u></p><a href="distinct-text.html" target="_blank" rel="noopener noreferrer">See distinct text examples</a>`, 
    `<p class='custom-bullet'><b>STEP 3</b> <span class='bullet-symbol'>&bull; </span>Paste the text into the input and then run a check on your website.</p><p>If the text is found, WebWatcher can use it to send you alerts.</p><p>If the text is not found, try other distinct text from your homepage.</p>`];
    const infoPosition = [{"top":"60%","left":"50%"},{"top":"12%","left":"50%"},{"top":"30%","left":"50%"}]
    let currentFeature = 0;

    function highlightFeatures(featureClass) {
        const elements = document.querySelectorAll(`.${featureClass}`);
        elements.forEach(el => {
            el.classList.add('highlight');
            if (el === elements[0]) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    function nextStep() {
        if (currentFeature > 0) {
            const prevElements = document.querySelectorAll(`.${features[currentFeature - 1]}`);
            prevElements.forEach(el => el.classList.remove('highlight'));
        }

        if (currentFeature < features.length) {
            highlightFeatures(features[currentFeature]);
            textBox.innerHTML = featureTexts[currentFeature]; // Update text box content
            textBox.style.left = infoPosition[currentFeature].left
            textBox.style.top = infoPosition[currentFeature].top
            currentFeature++;
        } else {
            endTutorial(); // End of tutorial
        }
    }

    function endTutorial() {
        document.body.removeChild(overlay);
        document.body.removeChild(textBox); // Remove text box
        const lastElements = document.querySelectorAll(`.${features[currentFeature - 1]}`);
        lastElements.forEach(el => el.classList.remove('highlight'));
    }

    overlay.addEventListener('click', nextStep); // Proceed to next step on overlay click
    nextStep(); // Start the first step
}

function successfulCheck() {
    var { overlay, infoBox } = initOverlay();
    infoBox.innerHTML = `<p><b>WebWatcher found the text!</b> This means you can use it to start monitoring your site.</p>
    <p><a href="#" onclick="navigateToCheckout()">Click here</a> to start using WebWatcher.</p>
    <p><a href="#" onclick="clearInfoBoxAfterCheck();">Click here</a> to run another check.</p>`
    infoBox.style.left = "50%";
    infoBox.style.top = "30%";
}

function failedCheck() {
    var { overlay, infoBox } = initOverlay();
    infoBox.innerHTML = `<p><b>WebWatcher could not find the text!</b> Try other text on your homepage or <a href="contact.html" target="_blank" rel="noopener noreferrer">contact us</a> for assistance.</p>
    <p><a href="#" onclick="clearInfoBoxAfterCheck();">Click here</a> to run another check.</p>`
    infoBox.style.left = "50%";
    infoBox.style.top = "30%";
}

function errorCheck() {
    var { overlay, infoBox } = initOverlay();
    infoBox.innerHTML = `<p>An error occurred.</br>Please check again or try later.</p>`
    infoBox.style.left = "50%";
    infoBox.style.top = "30%";
}

function paymentCancelled() {
    var { overlay, infoBox } = initOverlay();
    infoBox.innerHTML = `<p>Your payment was cancelled.</p>
    <p>Try again.</p>`
    infoBox.style.left = "50%";
    infoBox.style.top = "30%";
}

function paymentSuccessful() {
    var { overlay, infoBox } = initOverlay();
    infoBox.innerHTML = `<p>Your subscription was successful.</p>
    <p><a href="./webwatcher/webwatcher-logs.html">Click here</a> to see the results of WebWatcher runs.</p>
    <p>Later, click the tools tab, then "WebWatcher Logs" to see run results.</p>
    <p>If your site goes down, use WebWatcher Logs to see when the incident occurred.</p>`
    infoBox.style.left = "50%";
    infoBox.style.top = "30%";
}

function paymentError(err) {
    var { overlay, infoBox } = initOverlay();
    infoBox.innerHTML = `<p>An error occurred during the subscription proccess.</p>
    <p>`+err+`.</p>
    <p>Try again.</p>`
    infoBox.style.left = "50%";
    infoBox.style.top = "30%";
}

function startLoader() {
    var { overlay, infoBox } = initOverlay();

    var spinner = document.createElement("div");
    spinner.className = "spinner"; // Set the class to apply CSS

    infoBox.innerHTML = ''; // Clear out any existing content
    infoBox.innerHTML = `<p style="text-align:center;"><b>LOADING...</b></p>`
    infoBox.appendChild(spinner); // Add the spinner
    infoBox.style.left = "50%";
    infoBox.style.top = "30%";
}

function initOverlay() {
    var overlay = document.getElementById("overlay");
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.id = 'overlay'
        document.body.appendChild(overlay);
        overlay.addEventListener('click', clearInfoBoxAfterCheck);
    }

    var infoBox = document.getElementById("info-box");
    if (!infoBox) {
        infoBox = document.createElement('div');
        infoBox.className = 'info-box';
        infoBox.id = 'info-box';
        document.body.appendChild(infoBox);
    }
    return {"overlay": overlay,"infoBox":infoBox}
}

function clearInfoBoxAfterCheck() {
    var overlay = document.getElementById("overlay");
    var infoBox = document.getElementById("info-box");
    document.body.removeChild(overlay);
    document.body.removeChild(infoBox);
}

function navigateToCheckout() {
    // Retrieve values from the elements
    var domain = document.getElementById('domainInput').value;
    var text = document.getElementById('textToMonitor').value;

    // Construct the URL with query parameters
    var url = 'paypal.html?domain=' + encodeURIComponent(domain) + '&text=' + encodeURIComponent(text);

    // Navigate to the URL
    window.location.href = url;
}

if (window.location.href.includes('webwatcher-signup.html')) {
    startTutorial()
}

// Call the function on page load
window.onload = populateAccordion;




