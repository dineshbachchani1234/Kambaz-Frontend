/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Form, Card } from "react-bootstrap";
import * as coursesClient from "../../../../client";

export default function QuizPreview() {
  const { cid, qid } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const fetchedQuiz = await coursesClient.findQuizById(qid as string);
        setQuiz(fetchedQuiz);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [qid]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev: any) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!quiz) return;

    const answersArray = Object.keys(answers).map((questionId) => ({
      questionId,
      answer: answers[questionId],
    }));

    let score = 0;
    let totalPoints = 0;
    const gradedAnswers = quiz.questions.map((question: any) => {
      totalPoints += question.points || 0;
      const studentAnswer = answersArray.find((a: any) => a.questionId === question._id);
      let isCorrect = false;

      if (question.type === "Multiple Choice") {
        const correctChoice = question.choices?.find((c: any) => c.isCorrect);
        isCorrect = studentAnswer?.answer === correctChoice?.text;
      } else if (question.type === "True/False") {
        isCorrect = studentAnswer?.answer === question.correctAnswer;
      } else if (question.type === "Fill in the Blank") {
        const studentAnswerText = (studentAnswer?.answer || "").trim().toLowerCase();
        isCorrect = question.correctAnswers?.some((ca: string) =>
          ca.trim().toLowerCase() === studentAnswerText
        );
      }

      if (isCorrect) {
        score += question.points || 0;
      }

      return {
        questionId: question._id,
        answer: studentAnswer?.answer || "",
        isCorrect,
      };
    });

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    setResult({
      score,
      totalPoints,
      percentage,
      answers: gradedAnswers,
    });
    setSubmitted(true);
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!quiz) {
    return <div className="p-4">Quiz not found</div>;
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const oneQuestionAtATime = quiz.oneQuestionAtATime !== false;

  if (submitted && result) {
    return (
      <div className="p-4">
        <h2>Quiz Results</h2>
        <div className="mb-4">
          <h3>
            Score: {result.score} / {result.totalPoints} ({result.percentage}%)
          </h3>
        </div>
        {questions.map((question: any, index: number) => {
          const answer = result.answers.find((a: any) => a.questionId === question._id);
          return (
            <Card key={question._id} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5>
                    Question {index + 1} ({question.points} pts)
                  </h5>
                  {answer?.isCorrect ? (
                    <span className="text-success">✓ Correct</span>
                  ) : (
                    <span className="text-danger">✗ Incorrect</span>
                  )}
                </div>
                <div dangerouslySetInnerHTML={{ __html: question.question }} />
                <div className="mt-2">
                  <strong>Your Answer:</strong> {answer?.answer || "No answer"}
                </div>
                {question.type === "Multiple Choice" && (
                  <div className="mt-2">
                    <strong>Correct Answer:</strong>{" "}
                    {question.choices?.find((c: any) => c.isCorrect)?.text}
                  </div>
                )}
                {question.type === "True/False" && (
                  <div className="mt-2">
                    <strong>Correct Answer:</strong> {question.correctAnswer}
                  </div>
                )}
                {question.type === "Fill in the Blank" && (
                  <div className="mt-2">
                    <strong>Correct Answers:</strong> {question.correctAnswers?.join(", ")}
                  </div>
                )}
              </Card.Body>
            </Card>
          );
        })}
        <div className="mt-4">
          <Button variant="secondary" onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}`)}>
            Back to Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{quiz.title} - Preview</h2>
        <Button variant="secondary" onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}`)}>
          Edit Quiz
        </Button>
      </div>

      {oneQuestionAtATime ? (
        <div>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <p className="mb-0">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            {/* Question Navigation */}
            <div className="d-flex flex-wrap gap-2">
              {questions.map((_: any, idx: number) => (
                <Button
                  key={idx}
                  variant={idx === currentQuestionIndex ? "primary" : answers[questions[idx]._id] ? "success" : "outline-secondary"}
                  size="sm"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  style={{ minWidth: "40px" }}
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
          </div>
          {currentQuestion && (
            <Card className="mb-3">
              <Card.Body>
                <h5>
                  {currentQuestion.title} ({currentQuestion.points} pts)
                </h5>
                <div
                  className="mb-3"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                />
                {currentQuestion.type === "Multiple Choice" && (
                  <div>
                    {currentQuestion.choices?.map((choice: any, idx: number) => (
                      <Form.Check
                        key={idx}
                        type="radio"
                        name={`question-${currentQuestion._id}`}
                        label={choice.text}
                        checked={answers[currentQuestion._id] === choice.text}
                        onChange={() => handleAnswerChange(currentQuestion._id, choice.text)}
                      />
                    ))}
                  </div>
                )}
                {currentQuestion.type === "True/False" && (
                  <div>
                    <Form.Check
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      label="True"
                      checked={answers[currentQuestion._id] === "True"}
                      onChange={() => handleAnswerChange(currentQuestion._id, "True")}
                    />
                    <Form.Check
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      label="False"
                      checked={answers[currentQuestion._id] === "False"}
                      onChange={() => handleAnswerChange(currentQuestion._id, "False")}
                    />
                  </div>
                )}
                {currentQuestion.type === "Fill in the Blank" && (
                  <Form.Control
                    type="text"
                    value={answers[currentQuestion._id] || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    placeholder="Enter your answer"
                  />
                )}
              </Card.Body>
            </Card>
          )}
          <div className="d-flex justify-content-between">
            <Button
              variant="secondary"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            >
              Previous
            </Button>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              >
                Next
              </Button>
            ) : (
              <Button variant="success" onClick={handleSubmit}>
                Submit Quiz
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {questions.map((question: any, index: number) => (
            <Card key={question._id} className="mb-3">
              <Card.Body>
                <h5>
                  Question {index + 1}: {question.title} ({question.points} pts)
                </h5>
                <div
                  className="mb-3"
                  dangerouslySetInnerHTML={{ __html: question.question }}
                />
                {question.type === "Multiple Choice" && (
                  <div>
                    {question.choices?.map((choice: any, idx: number) => (
                      <Form.Check
                        key={idx}
                        type="radio"
                        name={`question-${question._id}`}
                        label={choice.text}
                        checked={answers[question._id] === choice.text}
                        onChange={() => handleAnswerChange(question._id, choice.text)}
                      />
                    ))}
                  </div>
                )}
                {question.type === "True/False" && (
                  <div>
                    <Form.Check
                      type="radio"
                      name={`question-${question._id}`}
                      label="True"
                      checked={answers[question._id] === "True"}
                      onChange={() => handleAnswerChange(question._id, "True")}
                    />
                    <Form.Check
                      type="radio"
                      name={`question-${question._id}`}
                      label="False"
                      checked={answers[question._id] === "False"}
                      onChange={() => handleAnswerChange(question._id, "False")}
                    />
                  </div>
                )}
                {question.type === "Fill in the Blank" && (
                  <Form.Control
                    type="text"
                    value={answers[question._id] || ""}
                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    placeholder="Enter your answer"
                  />
                )}
              </Card.Body>
            </Card>
          ))}
          <div className="mt-4">
            <Button variant="success" onClick={handleSubmit}>
              Submit Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

