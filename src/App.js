import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [isCustomCompetences, setIsCustomCompetences] = useState(false);
  const [evaluations, setEvaluations] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fileImported, setFileImported] = useState(false);

  const nextButtonPage1Ref = useRef(null);
  const nextButtonPage2Ref = useRef(null);

  // Nouvelle fonction pour changer de page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const defaultCompetences = [
    { name: "Compréhension", coefficient: 1 },
    { name: "Réalisation technique", coefficient: 1 },
    { name: "Qualité des résultats", coefficient: 1 },
    { name: "Autonomie", coefficient: 1 },
  ];

  // Fonction pour importer le fichier CSV des élèves
  const handleStudentImport = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      const studentList = lines
        .filter((line) => line.trim())
        .map((line) => line.split(",")[0].trim());
      setStudents(studentList);
      setFileImported(true);
      setTimeout(() => {
        nextButtonPage1Ref.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    reader.readAsText(file);
  };

  // Fonction pour importer les compétences personnalisées
  const handleCompetencesImport = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      const competencesList = lines
        .filter((line) => line.trim())
        .map((line) => {
          const [name, coef] = line.split(",");
          return {
            name: name.trim(),
            coefficient: coef ? parseFloat(coef) : 1,
          };
        });
      setCompetences(competencesList);
      setTimeout(() => {
        nextButtonPage2Ref.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    reader.readAsText(file);
  };

  const handleEvaluation = (studentName, competence, value) => {
    setEvaluations((prev) => ({
      ...prev,
      [studentName]: {
        ...prev[studentName],
        [competence]: value,
      },
    }));
  };

  const calculateFinalGrade = (studentName) => {
    const studentEval = evaluations[studentName];
    if (!studentEval) return "";

    const activeCompetences = isCustomCompetences
      ? competences
      : defaultCompetences;
    let total = 0;
    let coeffSum = 0;

    activeCompetences.forEach((comp) => {
      if (studentEval[comp.name]) {
        total += studentEval[comp.name] * 5 * comp.coefficient;
        coeffSum += comp.coefficient;
      }
    });

    return coeffSum > 0 ? (total / coeffSum).toFixed(2) : "";
  };

  const exportResults = () => {
    const activeCompetences = isCustomCompetences
      ? competences
      : defaultCompetences;
    let csv = "NOM,Note";
    activeCompetences.forEach((comp) => {
      csv += `,Note ${comp.name}`;
    });
    csv += "\n";

    students.forEach((student) => {
      const finalGrade = calculateFinalGrade(student);
      csv += `${student},${finalGrade}`;
      activeCompetences.forEach((comp) => {
        const evalValue = evaluations[student]?.[comp.name] || "";
        csv += `,${evalValue}`;
      });
      csv += "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "evaluations.csv";
    a.click();
  };

  // Rendu de la page 1: Liste des élèves
  const renderPage1 = () => (
    <div className="page">
      <h2>Initialisation Liste Élèves</h2>
      <div className="import-section">
        <input
          type="file"
          accept=".csv"
          onChange={handleStudentImport}
          className="file-input"
        />
        <label className="file-label">Importer CSV des élèves</label>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student}>
                <td>{student}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {fileImported && (
        <button
          ref={nextButtonPage1Ref}
          onClick={() => handlePageChange(2)}
          className="next-button"
        >
          Suivant
        </button>
      )}
    </div>
  );

  // Rendu de la page 2: Choix des compétences
  const renderPage2 = () => (
    <div className="page">
      <h2>Choix des Compétences</h2>
      <div className="competences-choice">
        <label>
          <input
            type="radio"
            checked={!isCustomCompetences}
            onChange={() => setIsCustomCompetences(false)}
          />
          Compétences par défaut
        </label>
        <label>
          <input
            type="radio"
            checked={isCustomCompetences}
            onChange={() => setIsCustomCompetences(true)}
          />
          Compétences personnalisées
        </label>
      </div>

      {isCustomCompetences ? (
        <>
          <div className="import-section">
            <input
              type="file"
              accept=".csv"
              onChange={handleCompetencesImport}
              className="file-input"
            />
            <label className="file-label">
              Importer compétences personnalisées
            </label>
          </div>
          {competences.length > 0 && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Compétence</th>
                    <th>Coefficient</th>
                  </tr>
                </thead>
                <tbody>
                  {competences.map((comp) => (
                    <tr key={comp.name}>
                      <td>{comp.name}</td>
                      <td>{comp.coefficient}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Compétence</th>
                <th>Coefficient</th>
              </tr>
            </thead>
            <tbody>
              {defaultCompetences.map((comp) => (
                <tr key={comp.name}>
                  <td>{comp.name}</td>
                  <td>{comp.coefficient}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        ref={nextButtonPage2Ref}
        onClick={() => handlePageChange(3)}
        className="next-button"
      >
        Suivant
      </button>
    </div>
  );

  // Rendu de la page 3: Évaluation
  const renderPage3 = () => (
    <div className="page">
      <h2>Évaluation</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Note</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student}
                onClick={() => setSelectedStudent(student)}
                style={{
                  cursor: "pointer",
                  backgroundColor: evaluations[student] ? "#f0f8ff" : "white",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e6e6e6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = evaluations[student]
                    ? "#f0f8ff"
                    : "white")
                }
              >
                <td>{student}</td>
                <td>{calculateFinalGrade(student)}</td>
                <td>{evaluations[student] ? "Évaluée" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <div className="modal">
          <div className="modal-content">
            <h3>Évaluation de {selectedStudent}</h3>
            {(isCustomCompetences ? competences : defaultCompetences).map(
              (comp) => (
                <div key={comp.name} className="competence-evaluation">
                  <p>{comp.name}</p>
                  <div className="evaluation-buttons">
                    {[1, 2, 3, 4].map((value) => (
                      <button
                        key={value}
                        onClick={() =>
                          handleEvaluation(selectedStudent, comp.name, value)
                        }
                        className={
                          evaluations[selectedStudent]?.[comp.name] === value
                            ? "selected"
                            : ""
                        }
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
            <button
              onClick={() => setSelectedStudent(null)}
              className="close-button"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <button onClick={exportResults} className="export-button">
        Exporter CSV
      </button>
    </div>
  );

  return (
    <div className="App">
      <h1>Évaluation des Élèves</h1>
      {currentPage === 1 && renderPage1()}
      {currentPage === 2 && renderPage2()}
      {currentPage === 3 && renderPage3()}
    </div>
  );
}

export default App;
