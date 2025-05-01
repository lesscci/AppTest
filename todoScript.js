document.addEventListener("DOMContentLoaded", function () {
  // Variables globales
  let allQuestions = [];
  let selectedQuestions = [];

  // Elementos del DOM
  const numQuestionsSelect = document.getElementById("numQuestions");
  const themeCheckboxes = document.getElementById("themeCheckboxes");
  const generateTestBtn = document.getElementById("generateTest");
  const questionsContainer = document.getElementById("questionsContainer");
  const checkAnswersBtn = document.getElementById("checkAnswers");
  const restartTestBtn = document.getElementById("restartTest");
  const closeModalBtn = document.getElementById("closeModal");
  const resultModal = document.getElementById("resultModal");

  if (closeModalBtn && resultModal) {
    closeModalBtn.addEventListener("click", () => {
      resultModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === resultModal) {
        resultModal.style.display = "none";
      }
    });
  }

  // Función para mostrar el modal con contenido
  function showModal(content = "", isError = false) {
    const modal = document.getElementById("resultModal");
    const resultsDiv = document.getElementById("results");

    if (modal && resultsDiv) {
      resultsDiv.innerHTML = content;

      // Añade clase de error si es necesario
      if (isError) {
        modal.classList.add("error-modal");
      } else {
        modal.classList.remove("error-modal");
      }
      
      modal.style.display = "block";
    }
  }

  // Función para cerrar el modal
  function closeModal() {
    const modal = document.getElementById("resultModal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  // Cargar todas las preguntas de los temas
  async function loadAllQuestions() {
    try {
      const temas = [1, 2, 3, 4, 5]; // Ajusta según tus temas
      const requests = temas.map((tema) =>
        fetch(`../PREGUNTAS/preguntas-tema${tema}.json`)
          .then((res) => res.json())
          .then((data) => data.map((q) => ({ ...q, tema })))
      );

      const results = await Promise.all(requests);
      allQuestions = results.flat();

      // Crear checkboxes de temas
      createThemeCheckboxes(temas);
    } catch (error) {
      console.error("Error cargando preguntas:", error);
      questionsContainer.innerHTML = `
                <p class="error">Error al cargar las preguntas. Por favor, recarga la página.</p>
            `;
    }
  }

  // Crear checkboxes para selección de temas
  function createThemeCheckboxes(temas) {
    themeCheckboxes.innerHTML = temas
      .map(
        (tema) => `
            <label>
                <input type="checkbox" name="selectedThemes" value="${tema}" checked>
                Tema ${tema}
            </label>
        `
      )
      .join("");
  }

  // Generar test con los parámetros seleccionados
  function generateTest() {
    const numQuestions = parseInt(numQuestionsSelect.value);
    const selectedThemes = Array.from(
      document.querySelectorAll('input[name="selectedThemes"]:checked')
    ).map((cb) => parseInt(cb.value));

    // Filtrar preguntas por temas seleccionados
    const filteredQuestions = allQuestions.filter((q) =>
      selectedThemes.includes(q.tema)
    );

    if (filteredQuestions.length === 0) {
      questionsContainer.innerHTML = `
                <p class="error">No hay preguntas disponibles para los temas seleccionados.</p>
            `;
      return;
    }

    // Seleccionar preguntas aleatorias
    selectedQuestions = getRandomQuestions(filteredQuestions, numQuestions);

    // Mostrar preguntas
    renderQuestions(selectedQuestions);

    // Mostrar/ocultar botones
    generateTestBtn.style.display = "none";
    checkAnswersBtn.style.display = "block";
  }

  // Mostrar preguntas en el contenedor
  function renderQuestions(questions) {
    questionsContainer.innerHTML = "";

    questions.forEach((question, index) => {
      const questionDiv = document.createElement("div");
      questionDiv.className = "question";
      questionDiv.dataset.correctAnswer = question.answer;

      // Texto de la pregunta
      const questionText = document.createElement("p");
      questionText.textContent = `${index + 1}. ${question.question}`;
      questionDiv.appendChild(questionText);

      // Opciones de respuesta (mezcladas)
      const shuffledOptions = shuffleArray([...question.options]);

      shuffledOptions.forEach((option, i) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `question${index}`;
        input.value = option;
        input.id = `q${index}_opt${i}`;

        label.htmlFor = input.id;
        label.appendChild(input);
        label.appendChild(document.createTextNode(option));

        questionDiv.appendChild(label);
        questionDiv.appendChild(document.createElement("br"));
      });

      questionsContainer.appendChild(questionDiv);
    });
  }

  // Comprobar respuestas
  function checkAnswers() {
    // 1. Verificar si todas las preguntas están respondidas
    let allAnswered = true;
    const unansweredQuestions = [];

    selectedQuestions.forEach((question, index) => {
      const selectedOption = document.querySelector(
        `input[name="question${index}"]:checked`
      );

      if (!selectedOption) {
        allAnswered = false;
        unansweredQuestions.push(index + 1);

        // Resaltar pregunta no respondida
        const questionElement =
          document.querySelector(
            `.question-container[data-index="${index}"]`
          ) || document.querySelectorAll(".question")[index];
        if (questionElement) {
          questionElement.style.border = "2px solid #f39c12";
          setTimeout(() => (questionElement.style.border = ""), 2000);
        }
      }
    });

    if (!allAnswered) {
      showModal(
        `
                <h3>Faltan respuestas</h3>
                <p>Por favor responde todas las preguntas antes de comprobar.</p>
                <p>Preguntas sin responder: ${unansweredQuestions.join(
                  ", "
                )}</p>
            `,
        true
      );
      return;
    }

    // 2. Si todas están respondidas, proceder con la evaluación
    let correctAnswers = 0;
    const results = [];

    selectedQuestions.forEach((question, index) => {
      const selectedOption = document.querySelector(
        `input[name="question${index}"]:checked`
      );

      // Verificación segura del valor
      const userAnswer = selectedOption?.value;
      const isCorrect = userAnswer === question.answer;

      if (isCorrect) correctAnswers++;

      // Resaltar respuestas
      document
        .querySelectorAll(`input[name="question${index}"]`)
        .forEach((input) => {
          const label = input.parentElement;
          if (!label) return;

          if (input.value === question.answer) {
            label.style.fontWeight = "bold";
            label.style.color = "#2ecc71"; // Verde
          } else if (input === selectedOption && !isCorrect) {
            label.style.color = "#e74c3c"; // Rojo
          }
        });

      // Guardar resultado
      if (selectedOption) {
        results.push({
          question: question.question,
          userAnswer: userAnswer,
          correctAnswer: question.answer,
          isCorrect,
          tema: question.tema,
        });
      }
    });

    // Mostrar resultados
    showResults(results, correctAnswers, selectedQuestions.length);

    // Actualizar UI
    if (checkAnswersBtn) checkAnswersBtn.style.display = "none";
    if (restartTestBtn) restartTestBtn.style.display = "block";
  }

  // Mostrar resultados en el modal
  function showResults(results, correctCount, totalQuestions) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ` 
            <h2>Resultados del Test</h2>
            <p class="score">${correctCount} de ${totalQuestions} correctas (${Math.round(
      (correctCount / totalQuestions) * 100
    )}%)</p>
           
        `;

    resultModal.style.display = "block";
  }

  // Funciones utilitarias
  function getRandomQuestions(questions, count) {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Event listeners
  generateTestBtn.addEventListener("click", generateTest);
  checkAnswersBtn.addEventListener("click", checkAnswers);
  restartTestBtn.addEventListener("click", () => window.location.reload());
  closeModalBtn.addEventListener(
    "click",
    () => (resultModal.style.display = "none")
  );
  window.addEventListener("click", (e) => {
    if (e.target === resultModal) resultModal.style.display = "none";
  });

  // Inicializar
  loadAllQuestions();
});
