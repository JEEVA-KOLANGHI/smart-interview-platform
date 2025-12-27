import { useState } from "react";
import API from "../services/api";
import "../components/Card.css";

const Admin = () => {
    const [title, setTitle] = useState("");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("");

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);
    };

    const submitQuestion = async (e) => {
        e.preventDefault();

        // Frontend validation
        if (!options.includes(correctAnswer)) {
            alert("Correct answer must match one of the options");
            return;
        }

        try {
            await API.post("/questions", {
                title: title.trim(),
                options: options.map((opt) => opt.trim()),
                correctAnswer: correctAnswer.trim(),
                topic,
                difficulty,
            });

            alert("Question added successfully");

            // Reset form
            setTitle("");
            setOptions(["", "", "", ""]);
            setCorrectAnswer("");
            setTopic("");
            setDifficulty("");
        } catch (error) {
            alert("Failed to add question");
        }
    };

    return (
        <div style={{ padding: "40px" }}>
            <h2>Admin Panel - Add Question</h2>

            <div className="card">
                <form onSubmit={submitQuestion}>
                    <input
                        placeholder="Question title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <br />
                    <br />

                    {options.map((opt, index) => (
                        <div key={index}>
                            <input
                                placeholder={`Option ${index + 1}`}
                                value={opt}
                                onChange={(e) =>
                                    handleOptionChange(index, e.target.value)
                                }
                                required
                            />
                            <br />
                        </div>
                    ))}

                    <br />

                    <select
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        required
                    >
                        <option value="">Select Correct Answer</option>
                        {options.map((opt, index) => (
                            <option key={index} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>

                    <br />
                    <br />

                    <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                    >
                        <option value="">Select Topic</option>
                        <option value="Java">Java</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="DSA">DSA</option>
                        <option value="SQL">SQL</option>
                        <option value="HR">HR</option>
                    </select>

                    <br />
                    <br />

                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        required
                    >
                        <option value="">Select Difficulty</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>

                    <br />
                    <br />

                    <button type="submit">Add Question</button>
                </form>
            </div>
        </div>
    );
};

export default Admin;
