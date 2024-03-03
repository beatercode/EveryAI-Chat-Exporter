// Funzione per estrarre i messaggi (sostituisci con la tua logica effettiva)
function extractMessages() {
  const userMessages = document.querySelectorAll(".user-query-container .query-content");
  const geminiMessages = document.querySelectorAll(".model-response-text div");

  var formattedContent = "";
  for (const [index, message] of userMessages.entries()) {
    formattedContent += `>>> # User:\n`;
    for (const element of message.children) {
      formattedContent += element.textContent + "\n";
    }
    formattedContent += `\n>>> # AI:\n`;
    for (const element of geminiMessages[index].children) {
      formattedContent += element.textContent + "\n";
    }
    formattedContent += "\n";
  }

  return formattedContent;
}

// Funzione per scaricare il file
async function downloadFile(content, filename) {
  try {
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error.message);
  }
}

// Funzione per mostrare un indicatore di caricamento
function showLoadingIndicator() {
  const loadingIndicator = document.createElement("div");
  loadingIndicator.id = "chat-export-loading";
  loadingIndicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
      z-index: 9999;
    `;

  // Create a spinner using CSS animation
  const spinner = document.createElement("div");
  spinner.classList.add("loading-spinner");
  spinner.style.cssText = `
      width: 70px;
      height: 70px;
      border: 5px solid white;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.8s linear infinite;
      /* Posiziona l'icona al centro del spinner */
      background-position: center;
      background-repeat: no-repeat;
      background-size: 48px;
    `;

  // Define the animation for the spinner
  const stylesheet = document.createElement("style");
  stylesheet.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
  document.head.appendChild(stylesheet);

  // Add the spinner to the loading indicator
  loadingIndicator.appendChild(spinner);

  document.body.appendChild(loadingIndicator);

  // Aggiungi l'icona come sfondo
  spinner.style.backgroundImage = `url("https://i.imgur.com/54wvaIv.png")`;
}

// Funzione per nascondere un indicatore di caricamento
function hideLoadingIndicator() {
  const loadingIndicator = document.getElementById("chat-export-loading");
  if (loadingIndicator) {
    document.body.removeChild(loadingIndicator);
  }
}

// Funzione per caricare tutti i messaggi scrollando la pagina
async function loadAllMessages() {
  // Variabile per il controllo del loop di scroll
  var hasMoreMessages = true;

  // Ottieni l'elemento infinite-scroller
  const scrollerElement = document.querySelector("infinite-scroller");

  showLoadingIndicator();
  // Scorrimento iniziale
  var lastScrollTop = scrollerElement.scrollTop;
  while (hasMoreMessages && lastScrollTop > 0) {
    await new Promise((resolve) => setTimeout(resolve, 10));
    scrollerElement.scrollTop = 0;
    lastScrollTop = scrollerElement.scrollTop;

    // Controllo se la pagina è cambiata (sezione nuova)
    const currentPageSection = document.querySelector(".conversation-section.ng-star-inserted");
    const previousPageSection = document.querySelector(".conversation-section.ng-star-inserted:nth-child(2)");
    if (currentPageSection && previousPageSection && currentPageSection.textContent === previousPageSection.textContent) {
      hasMoreMessages = false;
    }
  }

  // Scroll finale per caricare eventuali messaggi caricati dinamicamente
  for (var i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    scrollerElement.scrollTop = 0;
  }

  hideLoadingIndicator();

  // Salvataggio del file solo dopo il caricamento compvaro
  var fileContent = extractMessages();
  downloadFile(fileContent, `${Date.now()}.txt`);
}

chrome.runtime.onMessage.addListener(async function (request) {
  if (request === "exportChat") {
    await loadAllMessages();
  }
});
