/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { FaTrash, FaPlus } from "react-icons/fa";

export default function QuestionEditor({
  question,
  onSave,
  onCancel,
  onDelete,
}: {
  question: any;
  onSave: (question: any) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [formData, setFormData] = useState<any>({
    title: "",
    type: "Multiple Choice",
    points: 1,
    question: "",
    choices: [],
    correctAnswer: "True",
    correctAnswers: [],
  });

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title || "",
        type: question.type || "Multiple Choice",
        points: question.points || 1,
        question: question.question || "",
        choices: question.choices || [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        correctAnswer: question.correctAnswer || "True",
        correctAnswers: question.correctAnswers || [],
      });
    }
  }, [question]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleChoiceChange = (index: number, field: string, value: any) => {
    const updatedChoices = [...formData.choices];
    updatedChoices[index] = { ...updatedChoices[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, choices: updatedChoices }));
  };

  const handleAddChoice = () => {
    setFormData((prev: any) => ({
      ...prev,
      choices: [...prev.choices, { text: "", isCorrect: false }],
    }));
  };

  const handleRemoveChoice = (index: number) => {
    const updatedChoices = formData.choices.filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({ ...prev, choices: updatedChoices }));
  };

  const handleCorrectChoiceChange = (index: number) => {
    const updatedChoices = formData.choices.map((choice: any, i: number) => ({
      ...choice,
      isCorrect: i === index,
    }));
    setFormData((prev: any) => ({ ...prev, choices: updatedChoices }));
  };

  const handleAddCorrectAnswer = () => {
    setFormData((prev: any) => ({
      ...prev,
      correctAnswers: [...prev.correctAnswers, ""],
    }));
  };

  const handleCorrectAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...formData.correctAnswers];
    updatedAnswers[index] = value;
    setFormData((prev: any) => ({ ...prev, correctAnswers: updatedAnswers }));
  };

  const handleRemoveCorrectAnswer = (index: number) => {
    const updatedAnswers = formData.correctAnswers.filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({ ...prev, correctAnswers: updatedAnswers }));
  };

  const handleSave = () => {
    const updatedQuestion = {
      ...question,
      ...formData,
    };
    onSave(updatedQuestion);
  };

  return (
    <div>
      <Form>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Question Title</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter question title"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Question Type</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                <option value="Multiple Choice">Multiple Choice</option>
                <option value="True/False">True/False</option>
                <option value="Fill in the Blank">Fill in the Blank</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Points</Form.Label>
              <Form.Control
                type="number"
                value={formData.points}
                onChange={(e) => handleChange("points", parseInt(e.target.value) || 1)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Question</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.question}
                onChange={(e) => handleChange("question", e.target.value)}
                placeholder="Enter your question"
              />
            </Form.Group>
          </Col>
        </Row>

        {formData.type === "Multiple Choice" && (
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label>Choices</Form.Label>
              <Button variant="outline-primary" size="sm" onClick={handleAddChoice}>
                <FaPlus className="me-1" /> Add Choice
              </Button>
            </div>
            {formData.choices.map((choice: any, index: number) => (
              <div key={index} className="d-flex align-items-center mb-2">
                <Form.Check
                  type="radio"
                  name="correctChoice"
                  checked={choice.isCorrect}
                  onChange={() => handleCorrectChoiceChange(index)}
                  className="me-2"
                />
                <Form.Control
                  type="text"
                  value={choice.text}
                  onChange={(e) => handleChoiceChange(index, "text", e.target.value)}
                  placeholder={`Choice ${index + 1}`}
                  className="me-2"
                />
                {formData.choices.length > 2 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveChoice(index)}
                  >
                    <FaTrash />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {formData.type === "True/False" && (
          <div className="mb-3">
            <Form.Group>
              <Form.Label>Correct Answer</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  id="true-option"
                  name="trueFalseAnswer"
                  label="True"
                  checked={formData.correctAnswer === "True"}
                  onChange={() => handleChange("correctAnswer", "True")}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="false-option"
                  name="trueFalseAnswer"
                  label="False"
                  checked={formData.correctAnswer === "False"}
                  onChange={() => handleChange("correctAnswer", "False")}
                />
              </div>
            </Form.Group>
          </div>
        )}

        {formData.type === "Fill in the Blank" && (
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label>Possible Correct Answers</Form.Label>
              <Button variant="outline-primary" size="sm" onClick={handleAddCorrectAnswer}>
                <FaPlus className="me-1" /> Add Answer
              </Button>
            </div>
            {formData.correctAnswers.map((answer: string, index: number) => (
              <div key={index} className="d-flex align-items-center mb-2">
                <Form.Control
                  type="text"
                  value={answer}
                  onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
                  placeholder={`Answer ${index + 1}`}
                  className="me-2"
                />
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveCorrectAnswer(index)}
                >
                  <FaTrash />
                </Button>
              </div>
            ))}
            {formData.correctAnswers.length === 0 && (
              <p className="text-muted small">Add at least one correct answer</p>
            )}
          </div>
        )}

        <div className="d-flex gap-2 mt-4">
          <Button variant="primary" onClick={handleSave}>
            Save Question
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onDelete}>
            Delete Question
          </Button>
        </div>
      </Form>
    </div>
  );
}

