let currentProblemID = ''

// Reads problem ID, if the problem has been proken into steps, get the current step ID as well
function readProblem() {
  const problemElements = document.getElementsByClassName('GOBIPLGDDM');
  if (problemElements.length == 0) {
    return false;
  } else {
    const idArray = Array.from(problemElements, problemElements => problemElements.textContent);
    const problemID = idArray.pop();
    console.log(problemID);
    currentProblemID = problemID;

    let problemData = {};

    if (problemID.includes('-')) {
      problemData.type = 'step'
      problemData.step_id = problemID;
    } else {
      problemData.type = 'start'
      problemData.problem_id = problemID;
    }

    (async () => {
      const response = await chrome.runtime.sendMessage(problemData);
      console.log(response);
    })();
  }
}

const submitHandler = () => {
  console.log('clicked');
  const data = {
    type: 'submit', 
    problem_id: currentProblemID
  };

  (async () => {
    const response = await chrome.runtime.sendMessage(data);
    console.log(response);
  })();

}

const newProblemHandler = (event) => {
  if (event.srcElement.textContent == "Next Problem") {
    console.log('new problem');
    const data = {
      type: 'new problem'
    };

    (async () => {
      const response = await chrome.runtime.sendMessage(data);
      console.log(response);
    })();
  } 
}

const newProblemCallback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    for (const node of mutation.addedNodes){
      if(node.className == 'GOBIPLGDPI') {
        readProblem();
        
        const buttons = Array.from(document.getElementsByClassName('GOBIPLGDEL'));
        const currentSubmitButton = buttons.findLast((butt) => (butt.textContent == 'Submit Answer') && !butt.ariaHidden);
        const nextProblemButton = buttons.findLast((butt) => (butt.textContent == 'Next Problem'));

        const inputBox = Array.from(document.getElementsByClassName('gwt-TextBox')).pop();
        currentSubmitButton.addEventListener('click', submitHandler);
        nextProblemButton.addEventListener('click', newProblemHandler);

        inputBox.addEventListener('keypress', function(event) {
          if (event.key === 'Enter') {
            event.preventDefault();
            currentSubmitButton.click();
          }
        });
      }
    }
  }
};

// Waiting for DOM to load to read problem
const timer = setInterval(() => {
  const nodeSearch = document.getElementsByClassName('GOBIPLGDKI');
  if(nodeSearch.length != 0) {
    clearTimeout(timer);

    // Tracking HTML DOM changes in the problem set
    const targetNode = nodeSearch[0];

    console.log(targetNode);
    const config = {childList: true, subtree: true };

    const observer = new MutationObserver(newProblemCallback);
    observer.observe(targetNode, config);
  }
}, 150);
