/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Button, Nav, Tab } from "react-bootstrap";
import { updateQuiz, addQuiz } from "../../reducer";
import * as coursesClient from "../../../../client";
import QuizDetailsEditor from "../QuizDetailsEditor";
import QuizQuestionsEditor from "../QuizQuestionsEditor";

export default function QuizEditor() {
  const { cid, qid } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { quizzes } = useSelector((state: any) => state.quizzesReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);

  const role = currentUser?.role;
  const canEdit = role === "FACULTY" || role === "ADMIN";

  const existing = quizzes.find((q: any) => q._id === qid && q.course === cid);

  const [quiz, setQuiz] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (qid && qid !== "new") {
        try {
          const fetchedQuiz = await coursesClient.findQuizById(qid as string);
          setQuiz(fetchedQuiz);
        } catch (error) {
          console.error("Error fetching quiz:", error);
          router.push(`/Courses/${cid}/Quizzes`);
        }
      } else if (existing) {
        setQuiz(existing);
      } else if (qid === "new") {
        // New quiz - create default quiz object
        setQuiz({
          _id: undefined,
          title: "New Quiz",
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
          published: false,
          questions: [],
          course: cid,
        });
      }
      setLoading(false);
    };

    fetchQuiz();
  }, [qid, cid, existing, router]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!quiz && qid !== "new") {
    return <div className="p-4">Quiz not found</div>;
  }

  if (!canEdit) {
    return <div className="p-4">You don't have permission to edit this quiz.</div>;
  }

  const handleSave = async (updatedQuiz: any) => {
    try {
      if (!quiz?._id) {
        // Create new quiz
        const created = await coursesClient.createQuiz(cid as string, updatedQuiz);
        dispatch(addQuiz(created));
        // Navigate to Quiz Details screen
        router.push(`/Courses/${cid}/Quizzes/${created._id}`);
      } else {
        // Update existing quiz
        const saved = await coursesClient.updateQuiz(updatedQuiz);
        dispatch(updateQuiz(saved));
        setQuiz(saved);
        // Navigate to Quiz Details screen
        router.push(`/Courses/${cid}/Quizzes/${quiz._id}`);
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const handleSaveAndPublish = async (updatedQuiz: any) => {
    try {
      if (!quiz?._id) {
        // Create new quiz
        const created = await coursesClient.createQuiz(cid as string, {
          ...updatedQuiz,
          published: true,
        });
        dispatch(addQuiz(created));
      } else {
        // Update existing quiz
        const saved = await coursesClient.updateQuiz({
          ...updatedQuiz,
          published: true,
        });
        dispatch(updateQuiz(saved));
      }
      router.push(`/Courses/${cid}/Quizzes`);
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const handleCancel = () => {
    router.push(`/Courses/${cid}/Quizzes`);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{quiz?.title || "New Quiz"}</h2>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || "details")}>
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link eventKey="details">Details</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="questions">Questions</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content className="mt-3">
          <Tab.Pane eventKey="details">
            <QuizDetailsEditor
              quiz={quiz}
              onQuizChange={setQuiz}
              onSave={handleSave}
              onSaveAndPublish={handleSaveAndPublish}
              onCancel={handleCancel}
            />
          </Tab.Pane>
          <Tab.Pane eventKey="questions">
            <QuizQuestionsEditor
              quiz={quiz}
              onQuizChange={setQuiz}
              onSave={handleSave}
              onSaveAndPublish={handleSaveAndPublish}
              onCancel={handleCancel}
            />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}

