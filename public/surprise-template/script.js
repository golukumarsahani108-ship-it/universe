/* =========================================
   BIRTHDAY SURPRISE WEBSITE
   DYNAMIC COMPLETE SCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  let universeData = null;

  /* =========================================
     LOAD PUBLISHED UNIVERSE
  ========================================= */

  async function loadUniverseData() {
    if (!slug) return null;

    try {
      const response = await fetch(
        `/api/surprise/public?slug=${encodeURIComponent(slug)}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error("Could not load surprise data:", error);
      return null;
    }
  }

  universeData = await loadUniverseData();

  if (!universeData) {
    document.body.innerHTML = `
      <main
        style="
          min-height:100dvh;
          display:grid;
          place-items:center;
          padding:24px;
          text-align:center;
          font-family:Nunito,sans-serif;
          background:#210d18;
          color:white;
        "
      >
        <div>
          <div style="font-size:42px;margin-bottom:16px">♡</div>

          <h1 style="margin:0 0 10px">
            This little world is unavailable.
          </h1>

          <p style="opacity:.75">
            The surprise may have been unpublished or the link is invalid.
          </p>
        </div>
      </main>
    `;

    return;
  }

  /* =========================================
     HELPERS
  ========================================= */

  function page(type) {
    return (universeData.pages || []).find(
      (p) =>
        String(p.page_type || "").toLowerCase() ===
        type.toLowerCase()
    );
  }

  function setting(pageObject, key, fallback = "") {
    const value = pageObject?.settings?.[key];

    return value === undefined || value === null
      ? fallback
      : value;
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);

    if (
      el &&
      value !== undefined &&
      value !== null &&
      String(value).trim()
    ) {
      el.textContent = String(value);
    }
  }

  function setTextAll(selector, value) {
    if (
      value === undefined ||
      value === null ||
      !String(value).trim()
    ) {
      return;
    }

    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = String(value);
    });
  }

  function setHTML(selector, value) {
    const el = document.querySelector(selector);

    if (
      el &&
      value !== undefined &&
      value !== null
    ) {
      el.innerHTML = String(value);
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderMultiline(selector, value) {
    const el = document.querySelector(selector);

    if (!el || !value) return;

    const blocks = String(value)
      .split(/\r?\n\s*\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);

    el.innerHTML = (blocks.length ? blocks : [String(value)])
      .map(
        (x) =>
          `<p>${escapeHtml(x).replace(
            /\r?\n/g,
            "<br>"
          )}</p>`
      )
      .join("");
  }

  function setHeadingWithSpan(
    selector,
    value,
    firstFallback,
    secondFallback
  ) {
    const heading = document.querySelector(selector);

    if (!heading) return;

    const text = String(value || "");

    const parts = text.split(
      /\r?\n|<br\s*\/?>/i
    );

    const first =
      parts[0]?.trim() || firstFallback;

    const second =
      parts
        .slice(1)
        .join(" ")
        .trim() || secondFallback;

    heading.innerHTML = `
      ${escapeHtml(first)}
      <span>${escapeHtml(second)}</span>
    `;
  }

  /* =========================================
     DYNAMIC CONTENT
  ========================================= */

  function applyDynamicContent() {
    const universe = universeData.universe || {};

    const memories = page("memories");
    const birthday = page("birthday");
    const reasons = page("reasons");
    const letter = page("letter");
    const password = page("password");

    /*
      IMPORTANT:
      Collection data is saved inside the
      "surprises" page settings by the publish API.
    */

    const collectionPage = page("surprises");

    const collection =
      collectionPage?.settings || {};

    const personName =
      universe.person_name ||
      "my favourite person";

    document.title =
      universe.title ||
      "A Little Surprise For You ♡";

    /* =========================================
       WELCOME
    ========================================= */

    setText(
      ".brand",
      `FOR ${personName} ♡`
    );

    setText(
      ".description",
      universe.opening_message ||
        "There’s a surprise waiting for you."
    );

    /* =========================================
       MEMORIES
    ========================================= */

    const memoryTitle =
      memories?.title ||
      "Our little memories ♡";

    setHeadingWithSpan(
      ".memory-header h2",
      memoryTitle,
      "Our little",
      "memories ♡"
    );

    setText(
      ".memory-intro",
      memories?.content ||
        setting(
          memories,
          "intro",
          "little moments, silly smiles and memories I never want to forget."
        )
    );

    setText(
      ".memory-bottom > span",
      setting(
        memories,
        "bottomText",
        "made of tiny moments"
      )
    );

    const memoryMedia = (universeData.media || [])
      .filter(
        (x) =>
          String(x.media_type || "").toLowerCase() ===
          "image"
      )
      .sort(
        (a, b) =>
          (a.media_order || 0) -
          (b.media_order || 0)
      )
      .slice(0, 3);

    document
      .querySelectorAll(".memory-photo")
      .forEach((card, index) => {
        const item = memoryMedia[index];

        if (!item) return;

        const img = card.querySelector("img");

        const caption =
          card.querySelector(".photo-caption");

        if (img && item.public_url) {
          img.src = item.public_url;
        }

        if (caption) {
          caption.innerHTML = `
            <span>0${index + 1}</span>
            ${escapeHtml(
              item.metadata?.caption ||
                `memory ${index + 1} ♡`
            )}
          `;
        }
      });

    /* =========================================
       BIRTHDAY
    ========================================= */

    const birthdayTitle =
      birthday?.title ||
      "Happy Birthday beautiful ♡";

    setHeadingWithSpan(
      ".birthday-container h1",
      birthdayTitle,
      "Happy Birthday",
      "beautiful ♡"
    );

    setText(
      ".birthday-message",
      birthday?.settings?.message ||
        birthday?.message ||
        birthday?.content ||
        ""
    );

    setText(
      ".birthday-card > span",
      setting(
        birthday,
        "forYouText",
        "FOR YOU"
      )
    );

    /* =========================================
       REASONS / FAVOURITE PERSON
    ========================================= */

    const reasonItems =
      reasons?.settings?.items;

    if (
      Array.isArray(reasonItems) &&
      reasonItems.length
    ) {
      document
        .querySelectorAll(".love-card")
        .forEach((card, index) => {
          const item = reasonItems[index];

          if (!item) {
            card.style.display = "none";
            return;
          }

          const title =
            card.querySelector("h3");

          const text =
            card.querySelector("p");

          if (title) {
            title.textContent =
              item.title ||
              "Something special";
          }

          if (text) {
            text.textContent =
              item.text ||
              item.description ||
              "";
          }
        });
    }

    setText(
      ".love-intro",
      reasons?.content || ""
    );

    /* =========================================
       LETTER
    ========================================= */

    const letterTitle =
      letter?.title ||
      "A little letter just for you";

    setHeadingWithSpan(
      ".letter-paper h1",
      letterTitle,
      "A little letter",
      "just for you"
    );

    renderMultiline(
      ".letter-content",
      letter?.content || ""
    );

    setText(
      ".letter-sign",
      setting(
        letter,
        "signature",
        "your best friend ♡"
      )
    );

    /* =========================================
       PASSCODE
    ========================================= */

    setText(
      ".passcode-text",
      password?.content ||
        "Only someone special knows the magic number..."
    );

    setText(
      ".passcode-hint",
      setting(
        password,
        "hint",
        "enter the 4 digit secret ♡"
      )
    );

    /* =========================================
       LITTLE COLLECTION
    ========================================= */

    /*
      IMPORTANT:
      Collection title + subtitle are stored in:

      page_type = "surprises"

      title    -> collection title
      content  -> collection subtitle
      settings -> collection settings
    */

    const collectionEyebrow =
      collection.eyebrow ||
      "A LITTLE COLLECTION";

    const collectionTitle =
      collectionPage?.title ||
      "Little things for you ♡";

    const collectionSubtitle =
      collectionPage?.content ||
      "A few little surprises, made especially for you.";

    /* =========================================
       COLLECTION HEADER
    ========================================= */

    setTextAll(
      ".surprises-eyebrow",
      collectionEyebrow
    );

    setTextAll(
      ".surprises-page .section-eyebrow",
      collectionEyebrow
    );

    /*
      IMPORTANT:
      Original HTML has:

      .surprises-heading h1
      .surprises-heading p

      We should NOT replace the whole h1,
      because the original <span> design must remain.
    */

    const surprisesHeading =
      document.querySelector(
        "#surprisesPage .surprises-heading h1"
      );

    if (surprisesHeading) {
      const span =
        surprisesHeading.querySelector("span");

      if (span) {
        const titleParts =
          String(collectionTitle)
            .split(/\r?\n/)
            .map((x) => x.trim())
            .filter(Boolean);

        if (titleParts.length >= 2) {
          const firstPart =
            titleParts[0];

          const secondPart =
            titleParts.slice(1).join(" ");

          surprisesHeading.innerHTML = `
            ${escapeHtml(firstPart)}
            <span>${escapeHtml(secondPart)}</span>
          `;
        } else if (titleParts.length === 1) {
          span.textContent =
            titleParts[0];
        }
      }
    }

    setText(
      "#surprisesPage .surprises-heading p",
      collectionSubtitle
    );

    setTextAll(
      ".surprises-page .section-subtitle",
      collectionSubtitle
    );

    setTextAll(
      "#surprisesPage .eyebrow",
      collectionEyebrow
    );

    setTextAll(
      "#surprisesPage .collection-eyebrow",
      collectionEyebrow
    );

    setTextAll(
      "#surprisesPage .collection-title",
      collectionTitle
    );

    setTextAll(
      "#surprisesPage .collection-subtitle",
      collectionSubtitle
    );

    /* =========================================
       COLLECTION ITEM TEXT
    ========================================= */

    const collectionItems =
      Array.isArray(collection.items)
        ? collection.items
        : [];

    document
      .querySelectorAll(".surprise-item")
      .forEach((item, index) => {
        const data =
          collectionItems[index];

        if (!data) return;

        /*
          ORIGINAL HTML uses:

          <strong>Memories</strong>
          <small>our little moments</small>

          So we must target strong + small.
        */

        const title =
          item.querySelector("strong") ||
          item.querySelector("h3") ||
          item.querySelector(".surprise-title") ||
          item.querySelector(".item-title");

        const subtitle =
          item.querySelector("small") ||
          item.querySelector("p") ||
          item.querySelector(".surprise-subtitle") ||
          item.querySelector(".item-subtitle");

        if (title && data.title) {
          title.textContent =
            data.title;
        }

        if (subtitle && data.subtitle) {
          subtitle.textContent =
            data.subtitle;
        }
      });

    /* =========================================
       INDIVIDUAL MINI SURPRISE TEXT
    ========================================= */

    const memoriesText =
      collection.memoriesText ||
      "our little moments";

    const letterText =
      collection.letterText ||
      "words for you";

    const flowersText =
      collection.flowersText ||
      "a little bloom";

    const surpriseText =
      collection.surpriseText ||
      "something special";

    const secretText =
      collection.secretText ||
      "psst... don't tell";

    const musicText =
      collection.musicText ||
      "a song for you";

    /* =========================================
       MEMORIES MINI SURPRISE
    ========================================= */

    setText(
      "#memoriesModal .mini-surprise-text",
      memoriesText
    );

    setText(
      "#memoriesModal .modal-subtitle",
      memoriesText
    );

    /*
      Keep the original visual description.
      The custom collection text is already
      shown on the collection card.
    */

    /* =========================================
       LETTER MINI SURPRISE
    ========================================= */

    setText(
      "#letterModal .mini-surprise-text",
      letterText
    );

    setText(
      "#letterModal .modal-subtitle",
      letterText
    );

    /* =========================================
       FLOWERS MINI SURPRISE
    ========================================= */

    setText(
      "#flowersModal .mini-surprise-text",
      flowersText
    );

    setText(
      "#flowersModal .modal-subtitle",
      flowersText
    );

    /* =========================================
       CAT SURPRISE
    ========================================= */

    setText(
      "#catSurprise .mini-surprise-text",
      surpriseText
    );

    setText(
      "#catSurprise .modal-subtitle",
      surpriseText
    );

    /* =========================================
       SECRET MINI SURPRISE
    ========================================= */

    setText(
      "#secretModal .mini-surprise-text",
      secretText
    );

    setText(
      "#secretModal .modal-subtitle",
      secretText
    );

    /* =========================================
       MUSIC MINI SURPRISE
    ========================================= */

    setText(
      "#musicPopup .mini-surprise-text",
      musicText
    );

    setText(
      "#musicPopup .modal-subtitle",
      musicText
    );

    /* =========================================
       SECRET MESSAGE
    ========================================= */

    const secretPage =
      page("secret");

    if (secretPage) {
      const secretMessageValue =
        secretPage?.content ||
        setting(
          secretPage,
          "message",
          secretText
        ) ||
        secretText;

      /*
        Do not replace the whole #secretMessage
        element because it contains the original
        sparkle/design markup.
      */

      const secretHeading =
        document.querySelector(
          "#secretMessage h3"
        );

      const secretParagraph =
        document.querySelector(
          "#secretMessage p"
        );

      if (secretHeading) {
        secretHeading.textContent =
          secretMessageValue;
      }

      if (secretParagraph) {
        secretParagraph.textContent =
          "";
      }

      setText(
        "#secretModal .secret-content",
        secretMessageValue
      );
    }

    /* =========================================
       MUSIC
    ========================================= */

    const music =
      universe.music || {};

    const bg =
      document.getElementById("bgMusic");

    const sm =
      document.getElementById("surpriseMusic");

    if (
      bg &&
      music.backgroundMusicPath
    ) {
      bg.src =
        music.backgroundMusicPath;

      bg.load();
    }

    if (
      sm &&
      music.surpriseMusicPath
    ) {
      sm.src =
        music.surpriseMusicPath;

      sm.load();
    }

    if (!music.backgroundMusicPath) {
      const toggle =
        document.getElementById(
          "bgMusicToggle"
        );

      if (toggle) {
        toggle.style.display =
          "none";
      }
    }

    if (!music.surpriseMusicPath) {
      const item =
        document.querySelector(
          '.surprise-item[data-surprise="music"]'
        );

      if (item) {
        item.style.display =
          "none";
      }
    }

    /* =========================================
       LETTER MODAL
    ========================================= */

    if (letter?.content) {
      renderMultiline(
        "#letterModal .letter-content",
        letter.content
      );
    }
  }

  applyDynamicContent();

  /* =========================================
     PAGE ELEMENTS
  ========================================= */

  const openButton =
    document.getElementById("openButton");

  const message =
    document.getElementById("message");

  const memoryPage =
    document.getElementById("memoryPage");

  const nextMemory =
    document.getElementById("nextMemory");

  const birthdayPage =
    document.getElementById("birthdayPage");

  const birthdayNext =
    document.getElementById("birthdayNext");

  const lovePage =
    document.getElementById("lovePage");

  const loveNext =
    document.getElementById("loveNext");

  const letterPage =
    document.getElementById("letterPage");

  const letterNext =
    document.getElementById("letterNext");

  const passcodePage =
    document.getElementById("passcodePage");

  const unlockPage =
    document.getElementById("unlockPage");

  const unlockNext =
    document.getElementById("unlockNext");

  const surprisesPage =
    document.getElementById("surprisesPage");

  const oneLastButton =
    document.getElementById("oneLastButton");

  const finalPage =
    document.getElementById("finalPage");

  const finalReveal =
    document.getElementById("finalReveal");

  const birthdayReveal =
    document.getElementById("birthdayReveal");

  const confettiLayer =
    document.getElementById("confettiLayer");

  /* =========================================
     PAGE 1 → PAGE 2
  ========================================= */

  if (
    openButton &&
    memoryPage
  ) {
    openButton.addEventListener(
      "click",
      () => {
        document.body.classList.add(
          "memory-open"
        );

        if (message) {
          message.classList.remove(
            "show"
          );
        }

        setTimeout(() => {
          memoryPage.classList.add(
            "active"
          );
        }, 180);
      }
    );
  }

  /* =========================================
     PAGE 2 → PAGE 3
  ========================================= */

  if (
    nextMemory &&
    birthdayPage
  ) {
    nextMemory.addEventListener(
      "click",
      () => {
        memoryPage?.classList.remove(
          "active"
        );

        setTimeout(() => {
          birthdayPage.classList.add(
            "active"
          );
        }, 250);
      }
    );
  }

  /* =========================================
     PAGE 3 → PAGE 4
  ========================================= */

  if (
    birthdayNext &&
    lovePage
  ) {
    birthdayNext.addEventListener(
      "click",
      () => {
        birthdayPage?.classList.remove(
          "active"
        );

        setTimeout(() => {
          lovePage.classList.add(
            "active"
          );
        }, 250);
      }
    );
  }

  /* =========================================
     PAGE 4 → PAGE 5
  ========================================= */

  if (
    loveNext &&
    letterPage
  ) {
    loveNext.addEventListener(
      "click",
      () => {
        lovePage?.classList.remove(
          "active"
        );

        setTimeout(() => {
          letterPage.classList.add(
            "active"
          );
        }, 250);
      }
    );
  }

  /* =========================================
     PAGE 5 → PASSWORD / UNLOCK
  ========================================= */

  const PASSWORD_ENABLED =
    Boolean(
      universeData?.universe
        ?.password_enabled
    );

  if (
    letterNext &&
    passcodePage
  ) {
    letterNext.addEventListener(
      "click",
      () => {
        letterPage?.classList.remove(
          "active"
        );

        setTimeout(() => {
          if (PASSWORD_ENABLED) {
            passcodePage.classList.add(
              "active"
            );
          } else {
            unlockPage?.classList.add(
              "active"
            );
          }
        }, 250);
      }
    );
  }

  /* =========================================
     PASSCODE
  ========================================= */

  const passcodeDots =
    document.querySelectorAll(
      ".passcode-dots span"
    );

  const passcodeError =
    document.getElementById(
      "passcodeError"
    );

  const deletePass =
    document.getElementById(
      "deletePass"
    );

  const keypadButtons =
    document.querySelectorAll(
      ".keypad button[data-number]"
    );

  let enteredPasscode = "";

  function updatePasscodeDots() {
    passcodeDots.forEach(
      (dot, index) => {
        dot.classList.toggle(
          "filled",
          index <
            enteredPasscode.length
        );
      }
    );
  }

  async function checkPasscode() {
    if (!PASSWORD_ENABLED) {
      passcodePage?.classList.remove(
        "active"
      );

      setTimeout(() => {
        unlockPage?.classList.add(
          "active"
        );
      }, 180);

      return;
    }

    if (passcodeError) {
      passcodeError.classList.remove(
        "show"
      );
    }

    try {
      const response =
        await fetch(
          "/api/universes/access",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              slug,
              password:
                enteredPasscode,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.unlocked
      ) {
        throw new Error(
          result.error ||
            "Incorrect password."
        );
      }

      enteredPasscode = "";

      updatePasscodeDots();

      setTimeout(() => {
        passcodePage?.classList.remove(
          "active"
        );

        setTimeout(() => {
          unlockPage?.classList.add(
            "active"
          );
        }, 180);
      }, 300);
    } catch (error) {
      if (passcodeError) {
        passcodeError.textContent =
          error?.message ||
          "hmm... that's not it ♡";

        passcodeError.classList.add(
          "show"
        );
      }

      const dots =
        document.getElementById(
          "passcodeDots"
        );

      if (dots) {
        dots.classList.remove(
          "shake"
        );

        void dots.offsetWidth;

        dots.classList.add(
          "shake"
        );
      }

      enteredPasscode = "";

      updatePasscodeDots();
    }
  }

  keypadButtons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          if (
            enteredPasscode.length >=
            4
          ) {
            return;
          }

          enteredPasscode +=
            button.dataset.number;

          if (passcodeError) {
            passcodeError.classList.remove(
              "show"
            );
          }

          updatePasscodeDots();

          if (
            enteredPasscode.length ===
            4
          ) {
            setTimeout(() => {
              checkPasscode();
            }, 180);
          }
        }
      );
    }
  );

  if (deletePass) {
    deletePass.addEventListener(
      "click",
      () => {
        enteredPasscode =
          enteredPasscode.slice(
            0,
            -1
          );

        if (passcodeError) {
          passcodeError.classList.remove(
            "show"
          );
        }

        updatePasscodeDots();
      }
    );
  }

  /* =========================================
     UNLOCK → LITTLE COLLECTION
  ========================================= */

  if (
    unlockNext &&
    surprisesPage
  ) {
    unlockNext.addEventListener(
      "click",
      () => {
        unlockPage?.classList.remove(
          "active"
        );

        setTimeout(() => {
          surprisesPage.classList.add(
            "active"
          );
        }, 250);
      }
    );
  }

  /* =========================================
     ONE LAST THING
  ========================================= */

  if (
    oneLastButton &&
    finalPage
  ) {
    oneLastButton.addEventListener(
      "click",
      () => {
        surprisesPage?.classList.remove(
          "active"
        );

        setTimeout(() => {
          finalPage.classList.add(
            "active"
          );
        }, 300);
      }
    );
  }

  /* =========================================
     FINAL BIRTHDAY REVEAL
  ========================================= */

  if (
    finalReveal &&
    birthdayReveal
  ) {
    finalReveal.addEventListener(
      "click",
      () => {
        birthdayReveal.classList.add(
          "show"
        );

        finalReveal.style.transform =
          "scale(.9)";

        finalReveal.style.opacity =
          "0";

        finalReveal.style.pointerEvents =
          "none";

        createConfetti();
      }
    );
  }

  function createConfetti() {
    if (!confettiLayer) return;

    confettiLayer.innerHTML = "";

    for (
      let i = 0;
      i < 70;
      i++
    ) {
      const piece =
        document.createElement(
          "span"
        );

      piece.className =
        "confetti";

      piece.style.left =
        Math.random() * 100 + "%";

      piece.style.animationDuration =
        3 +
        Math.random() * 3 +
        "s";

      piece.style.animationDelay =
        Math.random() * 1.5 +
        "s";

      piece.style.setProperty(
        "--drift",
        (Math.random() - 0.5) *
          260 +
          "px"
      );

      piece.style.transform =
        `rotate(${Math.random() * 360}deg)`;

      confettiLayer.appendChild(
        piece
      );
    }
  }

  /* =========================================
     BACKGROUND MUSIC
  ========================================= */

  const bgMusic =
    document.getElementById(
      "bgMusic"
    );

  const bgMusicToggle =
    document.getElementById(
      "bgMusicToggle"
    );

  const bgMusicText =
    bgMusicToggle?.querySelector(
      ".bg-music-text"
    );

  const surpriseMusic =
    document.getElementById(
      "surpriseMusic"
    );

  const musicPopup =
    document.getElementById(
      "musicPopup"
    );

  const musicPlay =
    document.getElementById(
      "musicPlay"
    );

  const musicClose =
    document.getElementById(
      "musicClose"
    );

  const musicProgress =
    document.getElementById(
      "musicProgress"
    );

  let backgroundMusicEnabled =
    true;

  let backgroundWasPlaying =
    false;

  function updateBackgroundMusicButton() {
    if (!bgMusicToggle) return;

    if (backgroundMusicEnabled) {
      bgMusicToggle.classList.remove(
        "off"
      );

      if (bgMusicText) {
        bgMusicText.textContent =
          "Music On";
      }
    } else {
      bgMusicToggle.classList.add(
        "off"
      );

      if (bgMusicText) {
        bgMusicText.textContent =
          "Music Off";
      }
    }
  }

  function startBackgroundMusic() {
    if (!bgMusic) return;

    if (!backgroundMusicEnabled) {
      return;
    }

    bgMusic
      .play()
      .catch(() => {});
  }

  /* FIRST USER INTERACTION */

  document.addEventListener(
    "click",
    () => {
      if (
        backgroundMusicEnabled &&
        bgMusic &&
        bgMusic.paused
      ) {
        startBackgroundMusic();
      }
    },
    {
      once: true,
    }
  );

  /* BG MUSIC TOGGLE */

  if (bgMusicToggle) {
    bgMusicToggle.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        backgroundMusicEnabled =
          !backgroundMusicEnabled;

        if (
          backgroundMusicEnabled
        ) {
          startBackgroundMusic();
        } else {
          if (bgMusic) {
            bgMusic.pause();
          }
        }

        updateBackgroundMusicButton();
      }
    );
  }

  /* =========================================
     MUSIC SURPRISE
  ========================================= */

  function openMusicSurprise() {
    if (!musicPopup) return;

    backgroundWasPlaying =
      !!(
        bgMusic &&
        !bgMusic.paused &&
        backgroundMusicEnabled
      );

    if (bgMusic) {
      bgMusic.pause();
    }

    if (surpriseMusic) {
      surpriseMusic.pause();

      surpriseMusic.currentTime =
        0;
    }

    if (musicPlay) {
      musicPlay.innerHTML =
        "<span>▶</span><b>Play Music</b>";
    }

    if (musicProgress) {
      musicProgress.style.width =
        "0%";
    }

    musicPopup.classList.add(
      "active"
    );
  }

  function closeMusicSurprise() {
    if (!musicPopup) return;

    if (surpriseMusic) {
      surpriseMusic.pause();

      surpriseMusic.currentTime =
        0;
    }

    if (musicProgress) {
      musicProgress.style.width =
        "0%";
    }

    if (musicPlay) {
      musicPlay.innerHTML =
        "<span>▶</span><b>Play Music</b>";
    }

    musicPopup.classList.remove(
      "active"
    );

    if (
      backgroundWasPlaying &&
      backgroundMusicEnabled
    ) {
      startBackgroundMusic();
    }

    backgroundWasPlaying = false;
  }

  /* =========================================
     PLAY MUSIC
  ========================================= */

  if (
    musicPlay &&
    surpriseMusic
  ) {
    musicPlay.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        if (surpriseMusic.paused) {
          if (bgMusic) {
            bgMusic.pause();
          }

          surpriseMusic
            .play()
            .then(() => {
              musicPlay.innerHTML =
                "<span>Ⅱ</span><b>Pause Music</b>";
            })
            .catch(() => {});
        } else {
          surpriseMusic.pause();

          musicPlay.innerHTML =
            "<span>▶</span><b>Play Music</b>";
        }
      }
    );
  }

  /* =========================================
     MUSIC PROGRESS
  ========================================= */

  if (
    surpriseMusic &&
    musicProgress
  ) {
    surpriseMusic.addEventListener(
      "timeupdate",
      () => {
        if (
          !surpriseMusic.duration
        ) {
          return;
        }

        const percent =
          (surpriseMusic.currentTime /
            surpriseMusic.duration) *
          100;

        musicProgress.style.width =
          percent + "%";
      }
    );

    surpriseMusic.addEventListener(
      "ended",
      () => {
        musicProgress.style.width =
          "0%";

        if (musicPlay) {
          musicPlay.innerHTML =
            "<span>▶</span><b>Play Again</b>";
        }
      }
    );
  }

  if (musicClose) {
    musicClose.addEventListener(
      "click",
      closeMusicSurprise
    );
  }

  if (musicPopup) {
    musicPopup.addEventListener(
      "click",
      (event) => {
        if (
          event.target.classList.contains(
            "music-popup-backdrop"
          )
        ) {
          closeMusicSurprise();
        }
      }
    );
  }

  /* =========================================
     SURPRISE MODALS
  ========================================= */

  const surpriseItems =
    document.querySelectorAll(
      ".surprise-item"
    );

  function closeAllSurpriseModals() {
    document
      .querySelectorAll(
        ".surprise-modal.active"
      )
      .forEach((modal) => {
        modal.classList.remove(
          "active"
        );
      });
  }

  function openModal(id) {
    const modal =
      document.getElementById(id);

    if (!modal) return;

    closeAllSurpriseModals();

    modal.classList.add(
      "active"
    );
  }

  /* =========================================
     SIX SURPRISE BUTTONS
  ========================================= */

  surpriseItems.forEach(
    (item) => {
      item.addEventListener(
        "click",
        (event) => {
          event.stopPropagation();

          item.classList.remove(
            "surprise-click"
          );

          void item.offsetWidth;

          item.classList.add(
            "surprise-click"
          );

          const type =
            item.dataset.surprise;

          /* MEMORIES */

          if (
            type === "memories"
          ) {
            setTimeout(() => {
              openModal(
                "memoriesModal"
              );
            }, 150);

            return;
          }

          /* LETTER */

          if (
            type === "letter"
          ) {
            setTimeout(() => {
              openModal(
                "letterModal"
              );
            }, 150);

            return;
          }

          /* FLOWERS */

          if (
            type === "flowers"
          ) {
            setTimeout(() => {
              openModal(
                "flowersModal"
              );
            }, 150);

            return;
          }

          /* SURPRISE → CAT */

          if (
            type === "surprise"
          ) {
            setTimeout(() => {
              openCatSurprise();
            }, 180);

            return;
          }

          /* SECRET */

          if (
            type === "secret"
          ) {
            setTimeout(() => {
              openModal(
                "secretModal"
              );
            }, 150);

            return;
          }

          /* MUSIC */

          if (
            type === "music"
          ) {
            setTimeout(() => {
              openMusicSurprise();
            }, 150);

            return;
          }
        }
      );
    }
  );

  /* =========================================
     CLOSE EXTRA MODALS
  ========================================= */

  document
    .querySelectorAll(
      "[data-close]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          event.stopPropagation();

          const id =
            button.dataset.close;

          const modal =
            document.getElementById(
              id
            );

          if (modal) {
            modal.classList.remove(
              "active"
            );
          }
        }
      );
    });

  /* =========================================
     BACKDROP CLOSE
  ========================================= */

  document
    .querySelectorAll(
      ".surprise-modal"
    )
    .forEach((modal) => {
      modal.addEventListener(
        "click",
        (event) => {
          if (
            event.target.classList.contains(
              "surprise-backdrop"
            )
          ) {
            modal.classList.remove(
              "active"
            );
          }
        }
      );
    });

  /* =========================================
     SECRET REVEAL
  ========================================= */

  const secretRevealButton =
    document.getElementById(
      "secretRevealButton"
    );

  const secretMessage =
    document.getElementById(
      "secretMessage"
    );

  if (
    secretRevealButton &&
    secretMessage
  ) {
    secretRevealButton.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        secretMessage.classList.add(
          "show"
        );

        secretRevealButton.textContent =
          "secret unlocked ♡";

        secretRevealButton.disabled =
          true;
      }
    );
  }

  /* =========================================
     CAT SURPRISE
  ========================================= */

  const catSurprise =
    document.getElementById(
      "catSurprise"
    );

  const catClose =
    document.getElementById(
      "catClose"
    );

  function openCatSurprise() {
    if (!catSurprise) return;

    closeAllSurpriseModals();

    catSurprise.classList.add(
      "active"
    );
  }

  function closeCatSurprise() {
    if (!catSurprise) return;

    catSurprise.classList.remove(
      "active"
    );
  }

  if (catClose) {
    catClose.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        closeCatSurprise();
      }
    );
  }

  /* =========================================
     ESCAPE KEY
  ========================================= */

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (
        musicPopup?.classList.contains(
          "active"
        )
      ) {
        closeMusicSurprise();
      }

      if (
        catSurprise?.classList.contains(
          "active"
        )
      ) {
        closeCatSurprise();
      }

      closeAllSurpriseModals();
    }
  );

  /* =========================================
     INITIAL STATE
  ========================================= */

  updateBackgroundMusicButton();
});