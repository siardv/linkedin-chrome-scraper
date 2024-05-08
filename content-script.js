if (typeof window !== 'undefined') {
  function globalErrorHandler(message, source, lineno, colno, error) {
    if (window.location.pathname.includes("/posts/")) {
      console.error("Caught error:", message, source, lineno, colno, error);
      if (message.includes("ERR_NETWORK_CHANGED")) {
        window.location.reload(true);
      }
    }
  }

  window.onerror = globalErrorHandler;
}

function checkLanguage() {
  let lang = [...document.cookie.split("; ")].filter((i) => i.includes("lang"));
  if (lang.length > 0) {
    lang = lang[0];
  }
  if (document.location.pathname.includes("/posts/")) {
    if (lang.includes("en-us")) return;
    const settingsURL =
      "https://www.linkedin.com/mypreferences/d/settings/language";
    alert(
      `Zorg ervoor dat taal ingesteld is op Engels.\nJe wordt naar de instellingenpagina geleid.`
    );
    document.location.href = settingsURL;
  }
}

console.save = function (data, filename, ext) {
  var blob = new Blob([data], {
    type: "text/plain"
  }),
    e = document.createEvent("MouseEvents"),
    a = document.createElement("a");
  a.download = `${filename}.${ext}`;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ["text/plain", a.download, a.href].join(":");
  e.initMouseEvent(
    "click",
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  );
  a.dispatchEvent(e);
};

function getShowMoreResultsButton(clickButton = false) {
  const btn = [
    ...document
      .querySelector('[class="feed-container-theme"]')
      .querySelectorAll("button")
  ].filter((i) => i.innerText.includes("Load more comments"));
  if (btn.length === 1) {
    btn[0].scrollIntoView({
      behavior: "smooth"
    });
    if (clickButton) {
      btn[0].click();
    } else {
      return btn[0];
    }
  } else {
    console.log("no 'show more results' button found");
    return false;
  }
}

function getPostDate(urn) {
  /*
    const anchorElements = [...urn.querySelectorAll("a[aria-label]")];
    const lastAnchorElement = anchorElements.pop();
    const ariaLabelValue = lastAnchorElement.ariaLabel;
    const dateMatch = ariaLabelValue.match(/[0-9]+[a-z]+/);
    const dateString = dateMatch[0];
    return dateString;
  */
  let x = urn.querySelector('[class*=update-components-actor__meta]')
  if (x) {
    x = x.querySelectorAll('a');
    x = [...x].filter(i => i.innerText.endsWith('ago'))
    if (x.length === 1) {
      x = x[0];
      if (x.innerText.includes('•')) {
        x = x.innerText.split('•')[0].trim();
        return x
      }
    }
  }
}

function getNumberOfReposts() {
  const socialDetails = document.querySelector(
    "[class*=social-details-social-counts]"
  );
  const countItems = socialDetails.querySelectorAll(
    "[class*=social-details-social-counts__item]"
  );
  const repostItem = [...countItems].filter((i) =>
    i.innerText.includes("gedeeld")
  );
  if (repostItem.length === 1) {
    return parseInt(repostItem[0].innerText.match(/[0-9]+/)[0], 10);
  } else {
    return 0;
  }
}

function getNumberOfComments() {
  const socialDetails = document.querySelector("[class*=social-details-social-counts]");
  if (!socialDetails) {
    console.log("No social details element found.");
    return 0;
  }
  const countItems = socialDetails.querySelectorAll("[class*=social-details-social-counts__item]");
  const commentItem = [...countItems].filter((i) =>
    i.innerText.match(/[0-9]+ comment[s]?/)
  );

  if (commentItem.length === 1) {
    return parseInt(commentItem[0].innerText.match(/[0-9]+/)[0], 10);
  } else {
    return 0;
  }
}

function getNumberOfLoadedComments() {
  try {
    return parseInt(
      [...document.cookie.split("; ")]
        .filter((i) => i.includes("loadedCommentsCount"))[0]
        .match(/[0-9]+/)[0]
    );
  } catch (error) {
    return 0;
  }
}

function countDuplicates(arr) {
  return arr.length - new Set(arr).size;
}

function triggerClickAndGetDetails() {
  return new Promise((resolve, reject) => {
    const socialButton = document
      .querySelector("[class*=social-details-social-counts]")
      .querySelector("button");
    if (socialButton) {
      socialButton.click();
    } else {
      reject("Sociale knop niet gevonden!");
      return;
    }

    const waitForDialog = setInterval(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        clearInterval(waitForDialog);
        collectReactions()
          .then((details) => {
            resolve(details);
          })
          .catch((error) => {
            reject(error);
          });
      }
    }, 1000);
  });
}

async function collectReactions() {
  let ALL = document
    .querySelector("[aria-multiselectable]")
    .querySelector("[class*=social-details-reactors-tab] button");
  ALL = ALL.innerText.replace(/,|\s/g, "").match(/[0-9]+/);

  const hasMoreReactions = document.querySelector(
    "[id=social-details-reactors-modal__header]"
  ).nextElementSibling;
  if (hasMoreReactions.childElementCount === 2) {
    hasMoreReactions.lastElementChild.querySelector("button").click();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const reactions = document.querySelectorAll(
    '[class="social-details-reactors-tab__icon-container"]'
  );
  let detailsObject = {};
  reactions.forEach((el) => {
    const match = el.innerText.replace(/,|\s/g, "").match(/[0-9]+/);
    if (match) {
      const reactionType = el
        .querySelector("img")
        .getAttribute("data-test-reactions-icon-type");
      const count = parseInt(match[0], 10);
      detailsObject[reactionType] = count;
    }
  });
  detailsObject.ALL = parseInt(ALL[0]);
  detailsObject = Object.fromEntries(
    Object.entries(detailsObject).sort((a, b) => b[1] - a[1])
  );
  return detailsObject;
}

function seeMore() {
  try {
    [...document.querySelectorAll("button")]
      .filter((i) => i.innerText === "...meer weergeven")
      .forEach((i) => i.click());
  } catch (e) { }
}

function loadMoreComments(overwrite = false) {
  let x = document.querySelector(
    '[class*="comments-comments-list__show-previous-container"]'
  );
  if (x) {
    x = x.querySelector("button");
    if (x) {
      const commentsCount = getNumberOfComments();
      const loadedCommentsCount = document
        .querySelector("[class*=comments-list]")
        .querySelectorAll("article").length;
      document.cookie = `loadedCommentsCount=${loadedCommentsCount}`;

      if (commentsCount === loadedCommentsCount) {
        return false;
      } else if (overwrite) {
        return false;
      }
      console.log("Meer reacties laden...");
      seeMore();
      x.click();
      seeMore();
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function convertToDays(dateStr) {
  const num = Number(dateStr.replace(/[a-z]+/, ''));
  const unit = dateStr.replace(/\d+/, '');
  const unitDays = {
    's': 1,
    'm': 1,
    'h': 1,
    'd': 1,
    'w': 7,
    'm': 30,
    'mo': 30,
    'y': 365,
    'yr': 365
  }[unit];
  return num * unitDays;
}

async function sortCommentsByRecent() {
  const toggleButton = document.querySelector(
    "[class*=comments-sort-order-toggle]"
  );
  if (toggleButton === null) {
    return;
  } else if (toggleButton.innerText.toLowerCase().includes("most recent")) {
    return false;
  }
  console.info("Sort comments by most recent...");
  toggleButton.querySelector("button").click();
  let i = 0;
  const dropdownInteraction = setInterval(() => {
    i++;
    [...toggleButton.querySelector("[class*=artdeco-dropdown]").querySelectorAll("li")].pop().click();
    if (i >= 1) {
      clearInterval(dropdownInteraction);
    }
  }, 1000);
  return true;
}

function getPostBody() {
  const postBody = document
    .querySelector("main")
    .querySelector("[class*=description-wrapper]")
    .querySelector("[class*=components-text]").innerText;
  return postBody;
}

function getComments() {
  let comments = document.querySelector("[class*=comments-list]");
  if (comments) {
    comments = [...comments.querySelectorAll("article")].map((i) => {
      let type = "overig";
      let name = i.querySelector("[class*=comments-post-meta__name-text]");
      if (name) {
        name = name.innerText.split("\n")[0];
      } else {
        name = "NA";
      }
      let id = i.querySelector("[class*=comments-post-meta__actor-link]");
      if (id) {
        id = id.pathname;
        if (id.includes("/in/")) {
          type = "persoon";
        } else if (id.includes("/company/")) {
          type = "bedrijf";
        }
      } else {
        id = "NA";
      }
      let comment = i.querySelector("[class*=comment-item-content-body]");
      if (comment) {
        comment = comment.innerText;
      } else {
        let reply = i.querySelector("[class*=comments-reply-item]");
        if (reply) {
          comment = i.querySelector(
            "[class*=comments-reply-item-content-body]"
          ).innerText;
        } else {
          comment = "NA";
        }
      }
      return {
        name: name,
        id: id,
        type: type,
        comment: comment
      };
    });
  }
  return comments;
}

function getActorName() {
  const actorName = document
    .querySelector("[class*=update-components-actor__name]")
    .querySelector("span").innerText;
  if (actorName.includes("\n")) {
    return actorName.split("\n")[0];
  } else {
    return actorName;
  }
}

function saveData(postData, nameType = 'fromURL', stringify = true, ext = "json") {
  if (nameType === 'fromURL') {
    let searchRef = ""
    try {
      searchRef = document.location.search;
      if (searchRef) {
        searchRef = searchRef.split('=');
      }
      if (searchRef.length === 2) {
        searchRef = `_${searchRef[1]}`
      }
    } catch (error) {
    }
    let fileName = document.location.pathname.slice(1).slice(0, -1).replaceAll("/", "_");
    fileName = `${fileName}${searchRef}`;
    if (stringify) {
      console.save(JSON.stringify(postData), fileName, ext);
    } else {
      console.save(postData, fileName, ext);
    }
  }
}

function disableTabs() {
  if (document.cookie.includes("tabsDisabled=true")) {
    return;
  }
  [...document.querySelector('[class*=org-feed-filters]').querySelectorAll('[role="tab"]')].filter((x) => !x.innerText.match(/Images|Videos/)).forEach(i => {
    i.disabled = true;
    i.style.opacity = "0.5";
    const originalLabel = i.innerText;
    i.addEventListener("mouseover", () => {
      i.innerText = "Werkt niet";
    });
    i.addEventListener("mouseout", () => {
      i.innerText = originalLabel;
    });
  });
  document.cookie = "tabsDisabled=true";
}

async function parseURLsFromFiles() {
  const response = await fetch(chrome.runtime.getURL("/urls.txt"));
  if (!response.ok) {
    throw new Error(`Failed to fetch the file`);
  }
  const text = await response.text();
  const lines = text.split("\n");
  const trimmedLines = lines.map((line) => line.trim());
  const filteredLines = trimmedLines.filter((line) => line.length > 0);
  console.info(`URLs geladen: ${filteredLines.length}`);
  return filteredLines;
}

function goToVideos() {
  if (!document.location.search.includes('feedView=images')) {
    return;
  }
  [...document.querySelector('[class*=org-feed-filters]').querySelectorAll('[role="tab"]')].filter((x) => x.innerText.match(/^Videos$/))[0].click();
}

function checkedIsAll() {
  let x = false;
  try {
    x = [...document.querySelector('[class*=org-feed-filters]').querySelectorAll('[role="tab"]')].filter((x) => x.ariaChecked === 'true')[0].innerText === "All"
  } catch (e) {
  }
  return x;
}

function isPostTooOld(urn) {
  const maxHistory = getMaxHistory();
  const maxHistoryInDays = convertToDays(maxHistory);
  const postDate = getPostDate(urn);
  const postDateInDays = convertToDays(postDate)
  console.info(`postDate: ${postDateInDays}, maxHistory: ${maxHistoryInDays}`);
  if (postDateInDays > maxHistoryInDays) {
    return true;
  } else {
    return false;
  }
}

function getMaxHistory() {
  let x = document.cookie;
  if (x.includes("maxHistory")) {
    x = x.match(/maxHistory=([0-9]+[a-z]+)/);
    if (x) {
      return x[1];
    }
  }
  return null;
}

function checkHash(setHash = null) {
  if (setHash !== null) {
    document.location.hash = setHash;
    document.cookie = `maxHistory=${setHash}`;
    document.location.reload(true);
  }
  const hash = document.location.hash;
  const pageHashMatch = hash.match(/[0-9]+[a-z]+/);
  let pageHash = null;
  if (pageHashMatch !== null) {
    pageHash = pageHashMatch[0].trim();
  }
  if (pageHash !== null) {
    if (getMaxHistory() === null) {
      document.cookie = `maxHistory=${pageHash}`;
    }
    return pageHash;
  }
  if (hash !== '' && pageHash === null) {
    document.location.hash = '';
  }
  const maxHistory = getMaxHistory();
  if (maxHistory !== null) {
    return maxHistory;
  }
  return null;
}

function blurWebpage(status = "on") {
  if (status === "off") {
    if (document.getElementById("blurryOverlay") !== null) {
      document.body.removeChild(document.getElementById("blurryOverlay"));
    }
    return;
  } else if (status === "on" && document.getElementById("blurryOverlay") === null) {
    const blurDiv = document.createElement("div");
    blurDiv.id = "blurryOverlay";
    blurDiv.style.position = "fixed";
    blurDiv.style.top = "0";
    blurDiv.style.left = "0";
    blurDiv.style.width = "100%";
    blurDiv.style.height = "100%";
    blurDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    blurDiv.style.zIndex = "9999";
    blurDiv.style.backdropFilter = "blur(15px)";
    document.body.insertBefore(blurDiv, document.body.firstChild);
  }
}

function promptHash(title, callback) {
  const promptDiv = document.createElement("div");
  promptDiv.id = "promptForHash";
  Object.assign(promptDiv.style, {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
    zIndex: "99999"
  });

  const promptTitle = document.createElement("div");
  promptTitle.innerHTML = title;
  promptTitle.style.marginBottom = "10px";
  promptDiv.appendChild(promptTitle);

  const promptInput = document.createElement("input");
  promptInput.type = "text";
  Object.assign(promptInput.style, { width: "100%" });
  promptInput.pattern = "[0-9]{1,2}[ymw]";
  promptInput.title = "Enter 1-2 digits followed by 'y', 'm', or 'w'";
  promptDiv.appendChild(promptInput);

  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.style.marginTop = "10px";
  submitButton.onclick = submitValue;
  Object.assign(submitButton.style, {
    marginTop: "10px",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "167ms",
    fontWeight: "600",
    justifyContent: "center",
    minWidth: "100%",
    maxWidth: "480px",
    overflow: "hidden",
    textAlign: "center",
    transitionProperty: "background-color, box-shadow, color",
    verticalAlign: "middle !important",
    padding: "10px 5px 10px 5px",
    backgroundColor: "#0b65c1",
    color: "white",
    borderRadius: "5px"
  });

  promptDiv.appendChild(submitButton);
  document.body.appendChild(promptDiv);
  promptInput.focus();

  promptInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      submitValue();
    }
  });

  function submitValue() {
    if (promptInput.value.match(/^\d{1,2}[ymw]$/)) {
      callback(promptInput.value);
      blurWebpage("off");
      document.body.removeChild(promptDiv);
    } else {
      promptInput.value = "";
      promptInput.placeholder = "Invalid format, try again.";
    }
  }
}

const title = `Stel de tijdsperiode in met een getal en tijdseenheid:<br><br>
<table style="padding: 10px; border-collapse: collapse;">
  <tr>
      <td style="padding: 0px 25px 0px 25px; background-color: #f2f2f2; border: none;">w</td>
      <td style="padding: 0px 0px 0px 0px; background-color: #f2f2f2; border: none;">=</td>

      <td style="padding: 0px 25px 0px 25px; background-color: #f2f2f2; border: none;">week</td>
  </tr>
  <tr>
      <td style="padding: 0px 25px 0px 25px; background-color: #f2f2f2; border: none;">m</td>
      <td style="padding: 0px 0px 0px 0px; background-color: #f2f2f2; border: none;">=</td>

      <td style="padding: 0px 25px 0px 25px; background-color: #f2f2f2; border: none;">maand</td>
  </tr>
  <tr>
      <td style="padding: 0px 25px 0px 25px; background-color: #f2f2f2; border: none;">y</td>
      <td style="padding: 0px 0px 0px 0px; background-color: #f2f2f2; border: none;">=</td>

      <td style="padding: 0px 25px 0px 25px; background-color: #f2f2f2; border: none;">jaar</td>
  </tr>
</table><br>Voorbeeld:  '2y' voor berichten van de afgelopen 2 jaar.<br><br>Je kunt de periode ook instellen via de URL met een hashtag:<br><a href="#">linkedin.com/posts/dit-is-een-post?feedView=images#2y</a><br><br>Het getal en de eenheid gelden als bovengrens. Oudere berichten worden niet meegenomen.`;

let didDownload = 0;
let allCommentsLoaded = 0;
let reactionDetails = null;
let didSortComments = false;
let hasButton = false;
let nextPath = null;
let doOverwrite = false;
document.cookie = "tabsDisabled=false";
const loadedCommentsCountArray = [];
const urnURLs = [];
let postData;
let iterations = 0;
let maxHistory = null;
document.cookie = "maxHistory=null";
const waitForPage = setInterval(() => {
  if (document.readyState === "complete") {
    clearInterval(waitForPage);
  }
}, 1000);
checkLanguage();

const mainLoop = setInterval(async () => {
  if (document.location.search.includes('feedView')) {
    console.log(`feedView is set: ${document.location.search}`);
    if (document.location.search.includes('feedView=all')) {
      checkedIsAll()
      document.location.href = `${document.location.origin}${document.location.pathname}?feedView=images${document.location.hash}`;
      return;
    } else {
      //
    }
    const maxHistory = checkHash();
    if (maxHistory === null) {
      if (!document.getElementById("blurryOverlay")) {
        blurWebpage("on");
      }
      if (!document.getElementById("promptForHash")) {
        promptHash(title, function (inputValue) {
          checkHash(inputValue)
        });
      }
      return;
    }
    blurWebpage("off");
    disableTabs();
    // document.body.style.zoom = "50%";
    const urn = document.querySelectorAll("[data-urn]")[0];
    document.querySelector('body').scrollIntoView();
    if (isPostTooOld(urn)) {
      saveData(urnURLs.join(","), 'fromURL', false, 'txt')
      if (document.location.search.includes('feedView=images')) {
        document.location.href = `${document.location.origin}${document.location.pathname}?feedView=videos${document.location.hash}`;
      } else if (document.location.search.includes('feedView=videos')) {
        document.location = `${document.location.origin}/posts/done/`;
        document.body.style.zoom = "100%";
        clearInterval(mainLoop);
      }
    }
    try {
      urn.nextElementSibling.click();
    } catch (error) { }
    urn
      .querySelector("[class*=feed-shared-control-menu]")
      .querySelector("button")
      .click();
    const x = setInterval(() => {
      try {
        const copyLink = [...document.querySelectorAll("h5")].filter(
          (i) => i.innerText.toLowerCase() === "copy link to post"
        )[0];
        if (copyLink) {
          copyLink.click();
          clearInterval(x);
        }
      } catch (error) { }
    }, 1000);

    const y = setInterval(() => {
      try {
        const toast = document.querySelector(
          '[class="artdeco-toast-item__content"]'
        );
        toast.querySelector("a[href]").pathname;
        if (toast) {
          const urnURL = toast.querySelector("a[href]").href;
          urnURLs.push(urnURL);
          console.info(urnURL);

          toast.parentElement.querySelector("button").click();
          urn.remove();
          clearInterval(y);
        }
      } catch (error) { }
    }, 1000);
  } else if (document.location.pathname.startsWith("/posts/")) {
    if (document.location.pathname.includes("/posts/done")) {
      document.body.style.zoom = "100%";
      let outlet = document.querySelector('[class=application-outlet]').querySelector('section');
      if (outlet.querySelector('h2') !== null) {
        outlet.querySelector('h2').innerText = "Klaar!";
        [...outlet.querySelectorAll("button")].forEach((i) => i.remove());
        [...outlet.querySelectorAll("p")].forEach((i) => i.remove());
        document.title = "Klaar!";
        clearInterval(mainLoop);
      }
      return;
    }
    if (document.location.pathname.includes("/posts/scrape")) {
      document.body.style.zoom = "50%";
      let outlet = document.querySelector('[class=application-outlet]').querySelector('section');
      if (outlet.querySelector('h2') !== null) {
        outlet.querySelector('h2').innerText = "Laden...";
        [...outlet.querySelectorAll("button")].forEach((i) => i.remove());
        [...outlet.querySelectorAll("p")].forEach((i) => i.remove());
        document.title = "Laden...";
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    if (iterations > 10) {
      if (!document.body.querySelector("main")) {
        document.location.reload(true);
      }
    }
    try {
      if (didDownload === 0) {
        if (nextPath === null) {
          const URLs = await parseURLsFromFiles();
          if (document.location.pathname.includes("/posts/scrape")) {
            console.info(`${URLs.length} URLs zijn geladen`);
            window.open(URLs[0], "_blank");
            chrome.runtime.sendMessage({ message: "closeTab" });
            return;
          }
          const currentPath = document.location.pathname.replace(/\/$/, "");
          const index = URLs.indexOf(currentPath);
          document.title = `${index + 1} van ${URLs.length}`;
          if (index === URLs.length - 1) {
            nextPath = "last";
          } else {
            nextPath = index !== -1 ? URLs[index + 1] : null;
          }
        }
        await sortCommentsByRecent();
        loadedCommentsCountArray.push(getNumberOfLoadedComments());
        if (countDuplicates(loadedCommentsCountArray) > 3) {
          doOverwrite = true;
        }
        hasButton = loadMoreComments(doOverwrite);
        if (hasButton === false) {
          allCommentsLoaded++;
          if (allCommentsLoaded < 2) {
            return;
          }
          console.info("Alle reacties zijn geladen (indien aanwezig)");
        } else {
          return;
        }
      }
      const translationButtons = document.querySelectorAll(
        "[class*=comments-see-translation-button]"
      );
      if (translationButtons && translationButtons.length > 0) {
        console.info("Vertaalbuttons worden verwijderd...");
        translationButtons.forEach((i) => i.remove());
      }
      if (reactionDetails === null) {
        console.info("Reactiedetails worden opgehaald...");
        await triggerClickAndGetDetails()
          .then((details) => {
            reactionDetails = details;
          })
          .catch((error) => {
            return Promise.reject(error);
          });
        console.info("Reactiedetails zijn opgehaald!");
      } else {
        const dismissButton = document.querySelector('[aria-label="Dismiss"]');
        if (dismissButton) {
          dismissButton.click();
        }
      }
      if (didDownload === 0) {
        const actorName = getActorName();
        const actorContainer = document.querySelector(
          '[class*="update-components-actor__container"]'
        );
        const postDateEst = getPostDate(actorContainer);
        const postBody = getPostBody();
        const comments = getComments();
        const repostCount = getNumberOfReposts();
        postData = [
          actorName,
          postDateEst,
          repostCount,
          postBody,
          comments,
          reactionDetails
        ];
        console.info("Postgegevens worden opgeslagen...");
        didDownload++;
      } else if (didDownload === 1) {
        didDownload++;
        saveData(postData);
      } else if (didDownload > 1) {
        try {
          if (nextPath && nextPath !== "last") {
            console.info(`Navigeren naar volgende bericht: ${nextPath}`);
            document.location.pathname = nextPath;
          } else if (nextPath === "last") {
            document.location = `${document.location.origin}/posts/done/`;
            // alert("Geen berichten meer om te verzamelen");
            //  chrome.runtime.sendMessage({ message: "closeTab" });
            clearInterval(mainLoop);
          }
        } catch (error) {
          let saveError = document.location.pathname
          saveError = `PARSE_ERROR: ${saveError}`;
          saveError = JSON.stringify(saveError);
          saveData(saveError)
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  iterations += 1;
}, 1500)
