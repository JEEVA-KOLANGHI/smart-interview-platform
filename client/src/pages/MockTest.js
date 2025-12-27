import { useEffect, useState } from "react";
import API from "../services/api";

const MockTest = () => {
    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selected, setSelected] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const startTest = async () => {
            try {
                const res = await API.get("/tests/start");
                setQuestions(res.data);
            } catch (error) {
                alert("Failed to start test");
            }
        };

        startTest();
    }, []);

    if (questions.length === 0) {
        return <h3>Loading mock test...</h3>;
    }

    const question = questions[current];

    const nextQuestion = () => {
        setAnswers([
            ...answers,
            {
                questionId: question._id,
                selectedAnswer: selected,
                correctAnswer: question.correctAnswer,
                topic: question.topic,
            },
        ]);

        setSelected("");
        setCurrent(current + 1);
    };

    const submitTest = async () => {
        const finalAnswers = [
            ...answers,
            {
                questionId: question._id,
                selectedAnswer: selected,
                correctAnswer: question.correctAnswer,
                topic: question.topic,
            },
        ];

        try {
            const res = await API.post("/tests/submit", {
                answers: finalAnswers,
                timeTaken: 120,
            });

            setScore(res.data.score);
            setSubmitted(true);
        } catch (error) {
            alert("Failed to submit test");
        }
    };

    if (submitted) {
        return (
            <div style={{ padding: "40px" }}>
                <h2>Mock Test Completed 🎉</h2>
                <h3>Your Score: {score}</h3>
            </div>
        );
    }

    return (
        <div style={{ padding: "40px" }}>
            <h2>Mock Test</h2>

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
                <button onClick={submitTest} disabled={!selected}>
                    Submit Test
                </button>
            )}
        </div>
    );
};

export default MockTest;
