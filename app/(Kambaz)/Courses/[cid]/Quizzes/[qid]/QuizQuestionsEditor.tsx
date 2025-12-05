/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import QuestionEditor from "./QuestionEditor";

export default function QuizQuestionsEditor({
  quiz,
  onQuizChange,
  onSave,
  onSaveAndPublish,
  onCancel,
}: {
  quiz: any;
  onQuizChange: (quiz: any) => void;
  onSave: (quiz: any) => void;
  onSaveAndPublish: (quiz: any) => void;
  onCancel: () => void;
}) {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const questions = quiz?.questions || [];

  const handleAddQuestion = () => {
    const newQuestion = {
      _id: uuidv4(),
      title: "Question " + (questions.length + 1),
      type: "Multiple Choice",
      points: 1,
      question: "",
      choices: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      correctAnswer: "True",
      correctAnswers: [],
      order: questions.length + 1,
    };

    const updatedQuiz = {
      ...quiz,
      questions: [...questions, newQuestion],
    };
    onQuizChange(updatedQuiz);
    setEditingQuestionId(newQuestion._id);
  };

  const handleUpdateQuestion = (questionId: string, updatedQuestion: any) => {
    const updatedQuestions = questions.map((q: any) =>
      q._id === questionId ? { ...updatedQuestion, _id: questionId } : q
    );
    const updatedQuiz = {
      ...quiz,
      questions: updatedQuestions,
    };
    onQuizChange(updatedQuiz);
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter((q: any) => q._id !== questionId);
    const updatedQuiz = {
      ...quiz,
      questions: updatedQuestions,
    };
    onQuizChange(updatedQuiz);
    if (editingQuestionId === questionId) {
      setEditingQuestionId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
  };

  const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5>Questions</h5>
          <p className="text-muted mb-0">
            Total Points: <strong>{totalPoints}</strong>
          </p>
        </div>
        <Button variant="primary" onClick={handleAddQuestion}>
          + New Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center p-5 border rounded">
          <p className="text-muted">No questions yet. Click "+ New Question" to add a question.</p>
        </div>
      ) : (
        <div>
          {questions
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((question: any, index: number) => (
              <div key={question._id} className="mb-3 border rounded p-3">
                {editingQuestionId === question._id ? (
                  <QuestionEditor
                    question={question}
                    onSave={(updatedQuestion) => handleUpdateQuestion(question._id, updatedQuestion)}
                    onCancel={handleCancelEdit}
                    onDelete={() => handleDeleteQuestion(question._id)}
                  />
                ) : (
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6>
                          {question.title || `Question ${index + 1}`} ({question.points || 0} pts)
                        </h6>
                        <p className="text-muted small mb-1">Type: {question.type}</p>
                        <div dangerouslySetInnerHTML={{ __html: question.question || "" }} />
                      </div>
                      <div>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setEditingQuestionId(question._id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger"
                          onClick={() => handleDeleteQuestion(question._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      <div className="d-flex gap-2 mt-4">
        <Button variant="primary" onClick={() => onSave(quiz)}>
          Save
        </Button>
        <Button variant="success" onClick={() => onSaveAndPublish(quiz)}>
          Save & Publish
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

