/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";

export default function QuizDetailsEditor({
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
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    quizType: "Graded Quiz",
    points: 0,
    assignmentGroup: "Quizzes",
    shuffleAnswers: true,
    hasTimeLimit: true,
    timeLimit: 20,
    multipleAttempts: false,
    attemptsAllowed: 1,
    showCorrectAnswers: "After submission",
    accessCode: "",
    oneQuestionAtATime: true,
    webcamRequired: false,
    lockQuestionsAfterAnswering: false,
    dueDate: "",
    dueDateInput: "",
    availableDate: "",
    availableDateInput: "",
    untilDate: "",
    untilDateInput: "",
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || "",
        description: quiz.description || "",
        quizType: quiz.quizType || "Graded Quiz",
        points: quiz.points || 0,
        assignmentGroup: quiz.assignmentGroup || "Quizzes",
        shuffleAnswers: quiz.shuffleAnswers !== undefined ? quiz.shuffleAnswers : true,
        hasTimeLimit: quiz.hasTimeLimit !== undefined ? quiz.hasTimeLimit : true,
        timeLimit: quiz.timeLimit || 20,
        multipleAttempts: quiz.multipleAttempts || false,
        attemptsAllowed: quiz.attemptsAllowed || 1,
        showCorrectAnswers: quiz.showCorrectAnswers || "After submission",
        accessCode: quiz.accessCode || "",
        oneQuestionAtATime: quiz.oneQuestionAtATime !== undefined ? quiz.oneQuestionAtATime : true,
        webcamRequired: quiz.webcamRequired || false,
        lockQuestionsAfterAnswering: quiz.lockQuestionsAfterAnswering || false,
        dueDate: quiz.dueDate || "",
        dueDateInput: quiz.dueDateInput || "",
        availableDate: quiz.availableDate || "",
        availableDateInput: quiz.availableDateInput || "",
        untilDate: quiz.untilDate || "",
        untilDateInput: quiz.untilDateInput || "",
      });
    }
  }, [quiz]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updatedQuiz = {
      ...quiz,
      ...formData,
      points: quiz?.questions
        ? quiz.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0)
        : formData.points,
    };
    onSave(updatedQuiz);
  };

  const handleSaveAndPublish = () => {
    const updatedQuiz = {
      ...quiz,
      ...formData,
      published: true,
      points: quiz?.questions
        ? quiz.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0)
        : formData.points,
    };
    onSaveAndPublish(updatedQuiz);
  };

  return (
    <div>
      <Form>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Quiz Title</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter quiz title"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter quiz description"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Quiz Type</Form.Label>
              <Form.Select
                value={formData.quizType}
                onChange={(e) => handleChange("quizType", e.target.value)}
              >
                <option value="Graded Quiz">Graded Quiz</option>
                <option value="Practice Quiz">Practice Quiz</option>
                <option value="Graded Survey">Graded Survey</option>
                <option value="Ungraded Survey">Ungraded Survey</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Points</Form.Label>
              <Form.Control
                type="number"
                value={formData.points}
                onChange={(e) => handleChange("points", parseInt(e.target.value) || 0)}
                readOnly
                style={{ backgroundColor: "#f5f5f5" }}
              />
              <Form.Text className="text-muted">
                Points are calculated from questions
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Assignment Group</Form.Label>
              <Form.Select
                value={formData.assignmentGroup}
                onChange={(e) => handleChange("assignmentGroup", e.target.value)}
              >
                <option value="Quizzes">Quizzes</option>
                <option value="Exams">Exams</option>
                <option value="Assignments">Assignments</option>
                <option value="Project">Project</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Shuffle Answers</Form.Label>
              <Form.Select
                value={formData.shuffleAnswers ? "Yes" : "No"}
                onChange={(e) => handleChange("shuffleAnswers", e.target.value === "Yes")}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Time Limit</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Check
                  type="checkbox"
                  label="Enable Time Limit"
                  checked={formData.hasTimeLimit}
                  onChange={(e) => handleChange("hasTimeLimit", e.target.checked)}
                  className="me-3"
                />
                {formData.hasTimeLimit && (
                  <Form.Control
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => handleChange("timeLimit", parseInt(e.target.value) || 20)}
                    style={{ width: "100px" }}
                    className="me-2"
                  />
                )}
                {formData.hasTimeLimit && <span>Minutes</span>}
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Multiple Attempts</Form.Label>
              <Form.Select
                value={formData.multipleAttempts ? "Yes" : "No"}
                onChange={(e) => handleChange("multipleAttempts", e.target.value === "Yes")}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {formData.multipleAttempts && (
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>How Many Attempts</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.attemptsAllowed}
                  onChange={(e) => handleChange("attemptsAllowed", parseInt(e.target.value) || 1)}
                />
              </Form.Group>
            </Col>
          </Row>
        )}

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Show Correct Answers</Form.Label>
              <Form.Select
                value={formData.showCorrectAnswers}
                onChange={(e) => handleChange("showCorrectAnswers", e.target.value)}
              >
                <option value="After submission">After submission</option>
                <option value="Never">Never</option>
                <option value="After due date">After due date</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Access Code</Form.Label>
              <Form.Control
                type="text"
                value={formData.accessCode}
                onChange={(e) => handleChange("accessCode", e.target.value)}
                placeholder="Leave blank for no access code"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>One Question at a Time</Form.Label>
              <Form.Select
                value={formData.oneQuestionAtATime ? "Yes" : "No"}
                onChange={(e) => handleChange("oneQuestionAtATime", e.target.value === "Yes")}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Webcam Required</Form.Label>
              <Form.Select
                value={formData.webcamRequired ? "Yes" : "No"}
                onChange={(e) => handleChange("webcamRequired", e.target.value === "Yes")}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Lock Questions After Answering</Form.Label>
              <Form.Select
                value={formData.lockQuestionsAfterAnswering ? "Yes" : "No"}
                onChange={(e) =>
                  handleChange("lockQuestionsAfterAnswering", e.target.value === "Yes")
                }
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.dueDateInput}
                onChange={(e) => handleChange("dueDateInput", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Available Date</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.availableDateInput}
                onChange={(e) => handleChange("availableDateInput", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Until Date</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.untilDateInput}
                onChange={(e) => handleChange("untilDateInput", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex gap-2 mt-4">
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="success" onClick={handleSaveAndPublish}>
            Save & Publish
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}

