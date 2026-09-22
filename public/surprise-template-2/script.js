/* =========================================================
   THE BOX — BIRTHDAY EDITION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     ELEMENTS
  ======================================================= */

  const screens = document.querySelectorAll(".screen");

  const introScreen = document.getElementById("introScreen");
  const accessScreen = document.getElementById("accessScreen");
  const fragmentsScreen = document.getElementById("fragmentsScreen");
  const mirrorScreen = document.getElementById("mirrorScreen");
  const frequencyScreen = document.getElementById("frequencyScreen");
  const archiveScreen = document.getElementById("archiveScreen");
  const messageScreen = document.getElementById("messageScreen");
  const coreScreen = document.getElementById("coreScreen");
  const finalScreen = document.getElementById("finalScreen");


  /* =======================================================
     STAR FIELD
  ======================================================= */

  const starsContainer = document.getElementById("stars");

  function createStars() {

    if (!starsContainer) return;

    starsContainer.innerHTML = "";

    const amount =
      window.innerWidth < 600
        ? 55
        : 110;

    for (let i = 0; i < amount; i++) {

      const star = document.createElement("span");

      star.className = "star";

      const size =
        Math.random() < .85
          ? Math.random() * 2 + 1
          : Math.random() * 3 + 1;

      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      star.style.left =
        `${Math.random() * 100}%`;

      star.style.top =
        `${Math.random() * 100}%`;

      star.style.setProperty(
        "--duration",
        `${3 + Math.random() * 7}s`
      );

      star.style.animationDelay =
        `${Math.random() * 6}s`;

      starsContainer.appendChild(star);
    }
  }

  createStars();


  /* =======================================================
     SCREEN NAVIGATION
  ======================================================= */

  function showScreen(screen) {

    if (!screen) return;

    screens.forEach(item => {
      item.classList.remove("active");
    });

    requestAnimationFrame(() => {
      screen.classList.add("active");
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }


  /* =======================================================
     INTRO → ACCESS
  ======================================================= */

  const enterButton =
    document.getElementById("enterButton");

  if (enterButton) {

    enterButton.addEventListener("click", () => {

      showScreen(accessScreen);

      setTimeout(() => {

        const firstInput =
          document.querySelector(".code-inputs input");

        if (firstInput) {
          firstInput.focus();
        }

      }, 650);

    });

  }


  /* =======================================================
     SECRET CODE
  ======================================================= */

  const SECRET_CODE = "2008";

  const codeInputs =
    document.querySelectorAll(".code-inputs input");

  const unlockButton =
    document.getElementById("unlockButton");

  const codeError =
    document.getElementById("codeError");


  function getCode() {

    return [...codeInputs]
      .map(input => input.value)
      .join("");

  }


  function clearCode() {

    codeInputs.forEach(input => {
      input.value = "";
    });

    if (codeInputs[0]) {
      codeInputs[0].focus();
    }

  }


  function checkCode() {

    const enteredCode = getCode();

    if (enteredCode.length !== 4) {
      return;
    }


    if (enteredCode === SECRET_CODE) {

      codeError?.classList.remove("show");

      codeInputs.forEach(input => {

        input.style.borderColor =
          "rgba(255, 190, 220, .65)";

        input.style.background =
          "rgba(255, 90, 165, .14)";

      });


      setTimeout(() => {

        showScreen(fragmentsScreen);

      }, 500);


    } else {

      codeError?.classList.add("show");

      codeError?.classList.remove("shake");

      void codeError?.offsetWidth;

      codeError?.classList.add("shake");

      codeInputs.forEach(input => {

        input.style.borderColor =
          "rgba(255, 90, 155, .55)";

      });


      setTimeout(() => {

        codeInputs.forEach(input => {

          input.style.borderColor =
            "rgba(255, 176, 214, .20)";

        });

      }, 700);


      setTimeout(clearCode, 500);

    }

  }


  codeInputs.forEach((input, index) => {

    input.addEventListener("input", () => {

      input.value =
        input.value.replace(/\D/g, "");

      if (
        input.value &&
        index < codeInputs.length - 1
      ) {

        codeInputs[index + 1].focus();

      }

      if (getCode().length === 4) {

        setTimeout(checkCode, 120);

      }

    });


    input.addEventListener("keydown", event => {

      if (
        event.key === "Backspace" &&
        !input.value &&
        index > 0
      ) {

        codeInputs[index - 1].focus();

      }


      if (event.key === "Enter") {

        checkCode();

      }

    });

  });


  unlockButton?.addEventListener(
    "click",
    checkCode
  );


  /* =======================================================
     FRAGMENTS
  ======================================================= */

  const fragmentData = {

    memory: {

      number: "01",

      icon: "◌",

      title: "MEMORY",

      description:
        "Some moments are tiny, but somehow they stay.",

      content:
        "Keep the little moments close. The random laughs, the silly conversations, the unexpected good days — those are often the ones that become the best memories."

    },


    question: {

      number: "02",

      icon: "?",

      title: "QUESTION",

      description:
        "A tiny question for your birthday.",

      content:
        "If you could keep one feeling from this year and carry it into the next one, what would you choose?"

    },


    secret: {

      number: "03",

      icon: "✦",

      title: "SECRET",

      description:
        "Something small was hidden here.",

      content:
        "Here is the secret: you made it this far. And that means there is still one more thing waiting for you."

    },


    sound: {

      number: "04",

      icon: "♫",

      title: "SOUND",

      description:
        "A little atmosphere for the moment.",

      content:
        "Sometimes a song can turn an ordinary moment into a memory. There is a little sound waiting for you in the next room."

    },


    message: {

      number: "05",

      icon: "♡",

      title: "MESSAGE",

      description:
        "Words that were waiting to be opened.",

      content:
        "Whatever this new year brings, I hope you find more reasons to smile, more things to look forward to and plenty of moments worth remembering."

    }

  };


  const fragmentButtons =
    document.querySelectorAll(".fragment");


  const fragmentModal =
    document.getElementById("fragmentModal");

  const modalClose =
    document.getElementById("modalClose");

  const modalNumber =
    document.getElementById("modalNumber");

  const modalIcon =
    document.getElementById("modalIcon");

  const modalTitle =
    document.getElementById("modalTitle");

  const modalDescription =
    document.getElementById("modalDescription");

  const modalContent =
    document.getElementById("modalContent");


  function openFragment(type) {

    const data =
      fragmentData[type];

    if (!data || !fragmentModal) {
      return;
    }


    modalNumber.textContent =
      data.number;

    modalIcon.textContent =
      data.icon;

    modalTitle.textContent =
      data.title;

    modalDescription.textContent =
      data.description;

    modalContent.textContent =
      data.content;


    fragmentModal.classList.add("active");

    document.body.style.overflow =
      "hidden";

  }


  function closeFragment() {

    fragmentModal?.classList.remove("active");

    document.body.style.overflow =
      "";

  }


  fragmentButtons.forEach(button => {

    button.addEventListener("click", () => {

      const type =
        button.dataset.fragment;

      openFragment(type);

    });

  });


  modalClose?.addEventListener(
    "click",
    closeFragment
  );


  fragmentModal?.querySelector(
    ".modal-backdrop"
  )?.addEventListener(
    "click",
    closeFragment
  );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        fragmentModal?.classList.contains("active")
      ) {

        closeFragment();

      }

    }
  );


  /* =======================================================
     FRAGMENTS → MIRROR
  ======================================================= */

  const fragmentContinue =
    document.getElementById("fragmentContinue");


  fragmentContinue?.addEventListener(
    "click",
    () => {

      closeFragment();

      showScreen(mirrorScreen);

    }
  );


  /* =======================================================
     MIRROR INTERACTION
  ======================================================= */

  const mirror =
    document.querySelector(".mirror");

  const mirrorCenter =
    document.querySelector(".mirror-center");


  function moveMirror(x, y) {

    if (!mirror || !mirrorCenter) {
      return;
    }


    const rect =
      mirror.getBoundingClientRect();


    const percentX =
      (x - rect.left) /
      rect.width;


    const percentY =
      (y - rect.top) /
      rect.height;


    const rotateY =
      (percentX - .5) * 7;


    const rotateX =
      (percentY - .5) * -7;


    mirrorCenter.style.transform =
      `perspective(700px)
       rotateX(${rotateX}deg)
       rotateY(${rotateY}deg)
       translateZ(8px)`;

  }


  mirror?.addEventListener(
    "mousemove",
    event => {

      moveMirror(
        event.clientX,
        event.clientY
      );

    }
  );


  mirror?.addEventListener(
    "mouseleave",
    () => {

      if (mirrorCenter) {

        mirrorCenter.style.transform =
          "";

      }

    }
  );


  mirror?.addEventListener(
    "touchmove",
    event => {

      const touch =
        event.touches[0];

      if (!touch) return;

      moveMirror(
        touch.clientX,
        touch.clientY
      );

    },
    { passive: true }
  );


  const mirrorContinue =
    document.getElementById("mirrorContinue");


  mirrorContinue?.addEventListener(
    "click",
    () => {

      showScreen(frequencyScreen);

    }
  );


  /* =======================================================
     FREQUENCY / AUDIO
  ======================================================= */

  const frequencyButton =
    document.getElementById("frequencyButton");

  const frequencyAudio =
    document.getElementById("frequencyAudio");

  const waveform =
    document.getElementById("waveform");


  function setPlayingState(isPlaying) {

    if (!frequencyButton) return;

    if (isPlaying) {

      frequencyButton.innerHTML =
        "<span>Ⅱ</span>";

      waveform?.classList.add("playing");

    } else {

      frequencyButton.innerHTML =
        "<span>▶</span>";

      waveform?.classList.remove("playing");

    }

  }


  frequencyButton?.addEventListener(
    "click",
    async () => {

      if (!frequencyAudio) return;


      if (frequencyAudio.paused) {

        try {

          await frequencyAudio.play();

          setPlayingState(true);

        } catch (error) {

          console.log(
            "Add your music file as music.mp3"
          );

        }

      } else {

        frequencyAudio.pause();

        setPlayingState(false);

      }

    }
  );


  frequencyAudio?.addEventListener(
    "ended",
    () => {

      setPlayingState(false);

    }
  );


  /* =======================================================
     FREQUENCY → ARCHIVE
  ======================================================= */

  const frequencyContinue =
    document.getElementById("frequencyContinue");


  frequencyContinue?.addEventListener(
    "click",
    () => {

      if (frequencyAudio) {

        frequencyAudio.pause();

        setPlayingState(false);

      }

      showScreen(archiveScreen);

    }
  );


  /* =======================================================
     ARCHIVE INTERACTION
  ======================================================= */

  const archiveCards =
    document.querySelectorAll(".archive-card");


  const archiveMessages = {

    "01":
      "A small moment can become a surprisingly important memory. Save the ordinary days too.",

    "02":
      "Some days do not need to be perfect. They just need one good moment worth remembering.",

    "03":
      "This one is officially marked: KEEP. Some memories deserve their own little corner."

  };


  archiveCards.forEach(card => {

    card.addEventListener(
      "click",
      () => {

        const id =
          card.dataset.archive;

        modalNumber.textContent =
          `ARCHIVE ${id}`;

        modalIcon.textContent =
          "✦";

        modalTitle.textContent =
          "ARCHIVE OPENED";

        modalDescription.textContent =
          "A little piece of today.";

        modalContent.textContent =
          archiveMessages[id] ||
          "A memory saved inside the archive.";

        fragmentModal.classList.add("active");

      }
    );

  });


  /* =======================================================
     ARCHIVE → MESSAGE
  ======================================================= */

  const archiveContinue =
    document.getElementById("archiveContinue");


  archiveContinue?.addEventListener(
    "click",
    () => {

      showScreen(messageScreen);

    }
  );


  /* =======================================================
     MESSAGE → CORE
  ======================================================= */

  const messageContinue =
    document.getElementById("messageContinue");


  messageContinue?.addEventListener(
    "click",
    () => {

      showScreen(coreScreen);

    }
  );


  /* =======================================================
     CORE → FINAL
  ======================================================= */

  const revealButton =
    document.getElementById("revealButton");


  revealButton?.addEventListener(
    "click",
    () => {

      showScreen(finalScreen);

      setTimeout(() => {

        createConfetti();

      }, 250);

    }
  );


  /* =======================================================
     FINAL CONFETTI
  ======================================================= */

  function createConfetti() {

    const layer =
      document.getElementById("confettiLayer");

    if (!layer) return;


    layer.innerHTML = "";


    const pieces =
      window.innerWidth < 600
        ? 65
        : 110;


    const symbols = [
      "✦",
      "✧",
      "◆",
      "●",
      "▰"
    ];


    for (let i = 0; i < pieces; i++) {

      const piece =
        document.createElement("span");

      piece.className =
        "confetti";


      const isSymbol =
        Math.random() < .28;


      if (isSymbol) {

        piece.textContent =
          symbols[
            Math.floor(
              Math.random() * symbols.length
            )
          ];

        piece.style.width =
          "auto";

        piece.style.height =
          "auto";

        piece.style.background =
          "transparent";

        piece.style.color =
          Math.random() < .5
            ? "#ffb6d8"
            : "#fff1f7";

        piece.style.fontSize =
          `${7 + Math.random() * 10}px`;

      } else {

        piece.style.background =
          Math.random() < .5
            ? "#ff4ca5"
            : "#ffd8e9";

      }


      piece.style.left =
        `${Math.random() * 100}%`;

      piece.style.setProperty(
        "--fall",
        `${3 + Math.random() * 4}s`
      );

      piece.style.setProperty(
        "--drift",
        `${-180 + Math.random() * 360}px`
      );

      piece.style.setProperty(
        "--rotation",
        `${360 + Math.random() * 720}deg`
      );

      piece.style.animationDelay =
        `${Math.random() * 1.8}s`;


      layer.appendChild(piece);

    }

  }


  /* =======================================================
     RESTART
  ======================================================= */

  const restartButton =
    document.getElementById("restartButton");


  restartButton?.addEventListener(
    "click",
    () => {

      if (frequencyAudio) {

        frequencyAudio.pause();

        frequencyAudio.currentTime = 0;

        setPlayingState(false);

      }


      if (fragmentModal) {

        fragmentModal.classList.remove(
          "active"
        );

      }


      document
        .querySelectorAll(".code-inputs input")
        .forEach(input => {

          input.value = "";

          input.style.borderColor =
            "rgba(255, 176, 214, .20)";

          input.style.background =
            "rgba(255, 255, 255, .035)";

        });


      codeError?.classList.remove(
        "show"
      );


      const confettiLayer =
        document.getElementById(
          "confettiLayer"
        );

      if (confettiLayer) {

        confettiLayer.innerHTML = "";

      }


      showScreen(introScreen);

    }
  );


  /* =======================================================
     KEYBOARD SHORTCUTS
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        fragmentModal?.classList.contains("active")
      ) {

        closeFragment();

      }

    }
  );


  /* =======================================================
     RESIZE
  ======================================================= */

  let resizeTimer;

  window.addEventListener(
    "resize",
    () => {

      clearTimeout(resizeTimer);

      resizeTimer =
        setTimeout(() => {

          createStars();

        }, 250);

    }
  );


  /* =======================================================
     INITIAL STATE
  ======================================================= */

  showScreen(introScreen);

});