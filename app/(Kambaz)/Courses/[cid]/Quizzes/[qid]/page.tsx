/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Button, Table, Card } from "react-bootstrap";
import { updateQuiz, publishQuiz } from "../reducer";
import * as coursesClient from "../../../client";

export default function QuizDetails() {
  const { cid, qid } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { quizzes } = useSelector((state: any) => state.quizzesReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);

  const role = currentUser?.role;
  const canEdit = role === "FACULTY" || role === "ADMIN";
  const isStudent = role === "STUDENT";

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (qid) {
        try {
          const fetchedQuiz = await coursesClient.findQuizById(qid as string);
          setQuiz(fetchedQuiz);
        } catch (error) {
          console.error("Error fetching quiz:", error);
          router.push(`/Courses/${cid}/Quizzes`);
        }
      }
      setLoading(false);
    };

    fetchQuiz();
  }, [qid, cid, router]);

  const handlePublish = async () => {
    if (!quiz || !canEdit) return;
    try {
      const newPublishedState = !quiz.published;
      await coursesClient.publishQuiz(quiz._id, newPublishedState);
      dispatch(publishQuiz({ quizId: quiz._id, published: newPublishedState }));
      setQuiz({ ...quiz, published: newPublishedState });
    } catch (error) {
      console.error("Error publishing quiz:", error);
    }
  };

  const getTotalPoints = () => {
    if (quiz?.questions && quiz.questions.length > 0) {
      return quiz.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
    }
    return quiz?.points || 0;
  };

  const getQuestionCount = () => {
    return quiz?.questions ? quiz.questions.length : 0;
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!quiz) {
    return <div className="p-4">Quiz not found</div>;
  }

  // For students, show quiz details and start button
  if (isStudent) {
    return (
      <div className="p-4">
        <h2>{quiz.title}</h2>
        <div className="mb-3">
          <strong>Points:</strong> {getTotalPoints()}
        </div>
        <div className="mb-3">
          <strong>Questions:</strong> {getQuestionCount()}
        </div>
        {quiz.description && (
          <div className="mb-3">
            <strong>Description:</strong>
            <div dangerouslySetInnerHTML={{ __html: quiz.description }} />
          </div>
        )}
        <Button
          variant="primary"
          onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}/Take`)}
        >
          Start Quiz
        </Button>
      </div>
    );
  }

  // For faculty, show quiz details summary with actions
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{quiz.title}</h2>
        <div>
          <Button
            variant={quiz.published ? "warning" : "success"}
            className="me-2"
            onClick={handlePublish}
          >
            {quiz.published ? "Unpublish" : "Publish"}
          </Button>
          <Button
            variant="secondary"
            className="me-2"
            onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}/Preview`)}
          >
            Preview
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}/Edit`)}
          >
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <Card.Body>
          <Table bordered className="mb-0">
            <tbody>
              <tr>
                <td className="fw-bold" style={{ width: "200px" }}>Quiz Type</td>
                <td>{quiz.quizType || "Graded Quiz"}</td>
              </tr>
              <tr>
                <td className="fw-bold">Points</td>
                <td>{getTotalPoints()}</td>
              </tr>
              <tr>
                <td className="fw-bold">Assignment Group</td>
                <td>{quiz.assignmentGroup || "Quizzes"}</td>
              </tr>
              <tr>
                <td className="fw-bold">Shuffle Answers</td>
                <td>{quiz.shuffleAnswers ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="fw-bold">Time Limit</td>
                <td>{quiz.hasTimeLimit === false ? "No Time Limit" : `${quiz.timeLimit || 20} Minutes`}</td>
              </tr>
              <tr>
                <td className="fw-bold">Multiple Attempts</td>
                <td>{quiz.multipleAttempts ? "Yes" : "No"}</td>
              </tr>
              {quiz.multipleAttempts && (
                <tr>
                  <td className="fw-bold">How Many Attempts</td>
                  <td>{quiz.attemptsAllowed || 1}</td>
                </tr>
              )}
              <tr>
                <td className="fw-bold">Show Correct Answers</td>
                <td>{quiz.showCorrectAnswers || "After submission"}</td>
              </tr>
              <tr>
                <td className="fw-bold">Access Code</td>
                <td>{quiz.accessCode || "None"}</td>
              </tr>
              <tr>
                <td className="fw-bold">One Question at a Time</td>
                <td>{quiz.oneQuestionAtATime !== false ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="fw-bold">Webcam Required</td>
                <td>{quiz.webcamRequired ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="fw-bold">Lock Questions After Answering</td>
                <td>{quiz.lockQuestionsAfterAnswering ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="fw-bold">Due Date</td>
                <td>{quiz.dueDate || quiz.dueDateInput || "Not set"}</td>
              </tr>
              <tr>
                <td className="fw-bold">Available Date</td>
                <td>{quiz.availableDate || quiz.availableDateInput || "Not set"}</td>
              </tr>
              <tr>
                <td className="fw-bold">Until Date</td>
                <td>{quiz.untilDate || quiz.untilDateInput || "Not set"}</td>
              </tr>
              <tr>
                <td className="fw-bold">Number of Questions</td>
                <td>{getQuestionCount()}</td>
              </tr>
              <tr>
                <td className="fw-bold">Published</td>
                <td>{quiz.published ? "Yes" : "No"}</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {quiz.description && (
        <Card className="mt-3">
          <Card.Header>Description</Card.Header>
          <Card.Body>
            <div dangerouslySetInnerHTML={{ __html: quiz.description }} />
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
