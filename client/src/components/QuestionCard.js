import "./QuestionCard.css";

const QuestionCard = ({
    question,
    selectedAnswer,
    onSelectAnswer,
    showAnswer = false,
    isBookmarked = false,
    onToggleBookmark,
    showBookmark = false,
}) => {
    const isCorrect = selectedAnswer === question.correctAnswer;
    const isIncorrect = showAnswer && selectedAnswer && !isCorrect;

    return (
        <div className={`question-card ${showAnswer ? (isCorrect ? "correct" : isIncorrect ? "incorrect" : "") : ""}`}>
            <div className="question-header">
                <div className="question-meta">
                    <span className={`badge badge-${question.difficulty?.toLowerCase()}`}>
                        {question.difficulty}
                    </span>
                    <span className="badge badge-primary">{question.topic}</span>
                </div>
                {showBookmark && (
                    <button
                        className={`bookmark-btn ${isBookmarked ? "bookmarked" : ""}`}
                        onClick={onToggleBookmark}
                        title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
                    >
                        {isBookmarked ? "★" : "☆"}
                    </button>
                )}
            </div>

            <h3 className="question-title">{question.title}</h3>

            <div className="options-list">
                {question.options?.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectOption = showAnswer && option === question.correctAnswer;

                    return (
                        <div
                            key={index}
                            className={`option-item ${isSelected ? "selected" : ""
                                } ${isCorrectOption ? "correct-option" : ""} ${showAnswer && isSelected && !isCorrectOption
                                    ? "incorrect-option"
                                    : ""
                                }`}
                            onClick={() => !showAnswer && onSelectAnswer(option)}
                        >
                            <input
                                type="radio"
                                name={`question-${question._id}`}
                                value={option}
                                checked={isSelected}
                                onChange={() => !showAnswer && onSelectAnswer(option)}
                                disabled={showAnswer}
                            />
                            <span className="option-text">{option}</span>
                            {isCorrectOption && showAnswer && (
                                <span className="check-mark">✓</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {showAnswer && selectedAnswer && (
                <div className={`answer-feedback ${isCorrect ? "correct" : "incorrect"}`}>
                    <div className="feedback-header">
                        {isCorrect ? (
                            <span>✓ Correct!</span>
                        ) : (
                            <span>✗ Incorrect. Correct answer: {question.correctAnswer}</span>
                        )}
                    </div>
                    {question.explanation && (
                        <div className="explanation-box">
                            <strong>Explanation: </strong>
                            <p>{question.explanation}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionCard;
