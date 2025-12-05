/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";

import { FaPlus, FaCheckCircle, FaTrash, FaEllipsisV } from "react-icons/fa";
import { BsGripVertical } from "react-icons/bs";
import { IoEllipsisVertical } from "react-icons/io5";
import { RiEditBoxLine } from "react-icons/ri";

import {
  Button,
  Modal,
  Dropdown,
} from "react-bootstrap";

import { setQuizzes, deleteQuiz, publishQuiz } from "./reducer";
import * as coursesClient from "../../client";

export default function Quizzes() {
  const { cid } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { quizzes } = useSelector(
    (state: any) => state.quizzesReducer
  );
  const { currentUser } = useSelector(
    (state: any) => state.accountReducer
  );

  const role = currentUser?.role;
  const canEdit = role === "FACULTY" || role === "ADMIN";

  const courseQuizzes = quizzes
    .filter((quiz: any) => quiz.course === cid)
    .sort((a: any, b: any) => {
      // Sort by available date
      const dateA = a.availableDateInput ? new Date(a.availableDateInput).getTime() : 0;
      const dateB = b.availableDateInput ? new Date(b.availableDateInput).getTime() : 0;
      return dateA - dateB;
    });

  // Fetch quizzes on component load
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const fetchedQuizzes = await coursesClient.findQuizzesForCourse(cid as string);
        dispatch(setQuizzes(fetchedQuizzes));
        
        // Fetch scores for students
        if (role === "STUDENT" && currentUser?._id) {
          const scores: any = {};
          for (const quiz of fetchedQuizzes) {
            try {
              const attempts = await coursesClient.getQuizAttempts(quiz._id, currentUser._id);
              if (attempts.length > 0) {
                scores[quiz._id] = attempts[0].percentage;
              }
            } catch (error) {
              console.error(`Error fetching attempts for quiz ${quiz._id}:`, error);
            }
          }
          setQuizScores(scores);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    if (cid) {
      fetchQuizzes();
    }
  }, [cid, dispatch, role, currentUser]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<any>(null);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [quizScores, setQuizScores] = useState<any>({});

  const handleAddQuiz = async () => {
    if (!canEdit) return;
    try {
      const newQuiz = {
        title: "New Quiz",
        description: "",
        quizType: "Graded Quiz",
        points: 0,
        assignmentGroup: "Quizzes",
        shuffleAnswers: true,
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
        published: false,
        questions: [],
      };
      const createdQuiz = await coursesClient.createQuiz(cid as string, newQuiz);
      router.push(`/Courses/${cid}/Quizzes/${createdQuiz._id}/Edit`);
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  const handleRequestDelete = (quiz: any) => {
    if (!canEdit) return;
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (quizToDelete) {
      try {
        await coursesClient.deleteQuiz(quizToDelete._id);
        dispatch(deleteQuiz(quizToDelete._id));
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
    setShowDeleteModal(false);
    setQuizToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setQuizToDelete(null);
  };

  const handlePublish = async (quiz: any) => {
    if (!canEdit) return;
    try {
      const newPublishedState = !quiz.published;
      await coursesClient.publishQuiz(quiz._id, newPublishedState);
      dispatch(publishQuiz({ quizId: quiz._id, published: newPublishedState }));
    } catch (error) {
      console.error("Error publishing quiz:", error);
    }
  };

  const getAvailabilityStatus = (quiz: any) => {
    if (!quiz.availableDateInput) return "Not available";
    const now = new Date();
    const availableDate = new Date(quiz.availableDateInput);
    const untilDate = quiz.untilDateInput ? new Date(quiz.untilDateInput) : null;

    if (now < availableDate) {
      return `Not available until ${quiz.availableDate || "May 6 at 12:00am"}`;
    }
    if (untilDate && now > untilDate) {
      return "Closed";
    }
    return "Available";
  };

  const getTotalPoints = (quiz: any) => {
    if (quiz.questions && quiz.questions.length > 0) {
      return quiz.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
    }
    return quiz.points || 0;
  };

  const getQuestionCount = (quiz: any) => {
    return quiz.questions ? quiz.questions.length : 0;
  };

  return (
    <div id="wd-quizzes" className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quizzes</h2>
        {canEdit && (
          <Button
            variant="danger"
            id="wd-add-quiz"
            onClick={handleAddQuiz}
          >
            <FaPlus className="me-1" /> Quiz
          </Button>
        )}
      </div>

      {courseQuizzes.length === 0 ? (
        <div className="text-center p-5 border rounded">
          <p className="text-muted">No quizzes yet. Click the "+ Quiz" button to add a new quiz.</p>
        </div>
      ) : (
        <div className="list-group">
          {courseQuizzes.map((quiz: any, index: number) => (
            <div
              key={quiz._id}
              className="list-group-item d-flex align-items-start p-0 mb-2 border rounded"
            >
              <div className="p-3">
                <BsGripVertical className="fs-5 text-muted" />
              </div>

              <div className="p-3 flex-grow-1 ms-2 w-100">
                <div className="d-flex justify-content-between align-items-start w-100">
                  <div className="d-flex align-items-start flex-grow-1">
                    <div className="me-3">
                      {quiz.published ? (
                        <FaCheckCircle
                          className="text-success fs-5"
                          style={{ cursor: canEdit ? "pointer" : "default" }}
                          onClick={() => canEdit && handlePublish(quiz)}
                          title="Published - Click to unpublish"
                        />
                      ) : (
                        <span
                          className="fs-4"
                          style={{ cursor: canEdit ? "pointer" : "default" }}
                          onClick={() => canEdit && handlePublish(quiz)}
                          title="Unpublished - Click to publish"
                        >
                          🚫
                        </span>
                      )}
                    </div>

                    <div className="flex-grow-1">
                      {role === "STUDENT" ? (
                        <Link
                          href={`/Courses/${cid}/Quizzes/${quiz._id}/Take`}
                          className="text-decoration-none text-dark fw-bold"
                        >
                          {quiz.title}
                        </Link>
                      ) : (
                        <Link
                          href={`/Courses/${cid}/Quizzes/${quiz._id}`}
                          className="text-decoration-none text-dark fw-bold"
                        >
                          {quiz.title}
                        </Link>
                      )}

                      <div className="wd-quiz-details mt-1 text-muted small">
                        <span>{getAvailabilityStatus(quiz)}</span>
                        {quiz.dueDate && (
                          <>
                            {" | "}
                            <strong>Due</strong> {quiz.dueDate}
                          </>
                        )}
                        {" | "}
                        <strong>{getTotalPoints(quiz)} pts</strong>
                        {" | "}
                        <strong>{getQuestionCount(quiz)} Questions</strong>
                        {role === "STUDENT" && quizScores[quiz._id] !== undefined && (
                          <>
                            {" | "}
                            <strong>Score: {quizScores[quiz._id]}%</strong>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    {canEdit && (
                      <>
                        <div className="position-relative">
                          <Button
                            variant="link"
                            className="p-0 me-2"
                            onClick={() =>
                              setShowContextMenu(
                                showContextMenu === quiz._id ? null : quiz._id
                              )
                            }
                          >
                            <IoEllipsisVertical className="fs-4" />
                          </Button>

                          {showContextMenu === quiz._id && (
                            <div
                              className="position-absolute bg-white border rounded shadow"
                              style={{
                                right: 0,
                                top: "100%",
                                zIndex: 1000,
                                minWidth: "150px",
                              }}
                            >
                              <button
                                className="btn btn-link text-start w-100 p-2"
                                onClick={() => {
                                  router.push(`/Courses/${cid}/Quizzes/${quiz._id}`);
                                  setShowContextMenu(null);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-link text-start w-100 p-2"
                                onClick={() => {
                                  handlePublish(quiz);
                                  setShowContextMenu(null);
                                }}
                              >
                                {quiz.published ? "Unpublish" : "Publish"}
                              </button>
                              <button
                                className="btn btn-link text-danger text-start w-100 p-2"
                                onClick={() => {
                                  handleRequestDelete(quiz);
                                  setShowContextMenu(null);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal show={showDeleteModal} onHide={handleCancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Quiz</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{quizToDelete?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
