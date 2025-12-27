import { useEffect, useState } from "react";
import API from "../services/api";

const Practice = () => {
    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState("");

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await API.get("/questions");
                setQuestions(res.data);
            } catch (error) {
                alert("Failed to load questions");
            }
        };

        fetchQuestions();
    }, []);

    if (questions.length === 0) {
        return <h3>Loading questions...</h3>;
    }

    const question = questions[current];

    const nextQuestion = () => {
        setSelected("");
        setCurrent((prev) => prev + 1);
    };

    return (
        <div style={{ padding: "40px" }}>
            <h2>Practice Questions</h2>

            <h3>{question.title}</h3>

            {question.options.map((opt, index) => (
                <div key={index}>
                    <input
                        type="radio"
                        name="option"
                        value={opt}
                        checked={selected === opt}
                        onChange={() => setSelected(opt)}
                    />
                    {opt}
                </div>
            ))}

            <br />

            {current < questions.length - 1 ? (
                <button onClick={nextQuestion} disabled={!selected}>
                    Next
                </button>
            ) : (
                <p>Practice Completed 🎉</p>
            )}
        </div>
    );
};

export default Practice;
