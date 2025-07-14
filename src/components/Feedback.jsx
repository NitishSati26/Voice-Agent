import React, { useState, useEffect } from "react";
import { apiRequest } from "../utils/apiRequest";

export default function Feedback({ requestId }) {
  const [likeCount, setLikeCount] = useState(0);
  const [unlikeCount, setUnlikeCount] = useState(0);
  const [commentList, setCommentList] = useState([]);
  const [comment, setComment] = useState("");
  const [userAction, setUserAction] = useState(null); // "like" | "unlike"

  // Load saved feedback if exists
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("feedbackList") || "{}");
    if (stored[requestId]) {
      const { likeCount, unlikeCount, commentList, userAction } =
        stored[requestId];
      setLikeCount(likeCount);
      setUnlikeCount(unlikeCount);
      setCommentList(commentList);
      setUserAction(userAction);
    }
  }, [requestId]);

  // Save to localStorage
  const saveFeedback = (updated) => {
    const stored = JSON.parse(localStorage.getItem("feedbackList") || "{}");
    stored[requestId] = {
      likeCount,
      unlikeCount,
      commentList,
      userAction,
      ...updated,
    };
    localStorage.setItem("feedbackList", JSON.stringify(stored));
  };

  const handleLike = async () => {
    if (userAction === "like") return; // already liked

    const newLikeCount = likeCount + 1;
    const newUnlikeCount =
      userAction === "unlike" ? unlikeCount - 1 : unlikeCount;

    setLikeCount(newLikeCount);
    setUnlikeCount(newUnlikeCount);
    setUserAction("like");
    saveFeedback({
      likeCount: newLikeCount,
      unlikeCount: newUnlikeCount,
      userAction: "like",
    });

    await apiRequest("feedback", "POST", {
      request_id: requestId,
      feedback_score: 1,
      comment: "",
    });
  };

  const handleUnlike = async () => {
    if (userAction === "unlike") return; // already unliked

    const newUnlikeCount = unlikeCount + 1;
    const newLikeCount = userAction === "like" ? likeCount - 1 : likeCount;

    setUnlikeCount(newUnlikeCount);
    setLikeCount(newLikeCount);
    setUserAction("unlike");
    saveFeedback({
      likeCount: newLikeCount,
      unlikeCount: newUnlikeCount,
      userAction: "unlike",
    });

    await apiRequest("feedback", "POST", {
      request_id: requestId,
      feedback_score: -1,
      comment: "",
    });
  };

  const handleCommentSubmit = async () => {
    const trimmed = comment.trim();
    if (!trimmed) return;

    const updatedComments = [...commentList, trimmed];
    setCommentList(updatedComments);
    setComment("");
    saveFeedback({ commentList: updatedComments });

    await apiRequest("feedback", "POST", {
      request_id: requestId,
      feedback_score: 0,
      comment: trimmed,
    });
  };

  return (
    <div className="mt-3 p-2 border rounded bg-light">
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <button
          className={`btn btn-sm ${
            userAction === "like" ? "btn-success" : "btn-outline-success"
          }`}
          onClick={handleLike}
        >
          👍 Like ({likeCount})
        </button>
        <button
          className={`btn btn-sm ${
            userAction === "unlike" ? "btn-danger" : "btn-outline-danger"
          }`}
          onClick={handleUnlike}
        >
          👎 Dislike ({unlikeCount})
        </button>
      </div>

      {/* Comment box */}
      <div className="mt-3">
        <textarea
          className="form-control"
          placeholder="Write a comment…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          className="btn btn-primary btn-sm mt-2"
          onClick={handleCommentSubmit}
          disabled={!comment.trim()}
        >
          Submit Comment
        </button>
      </div>

      {/* Show existing comments */}
      {commentList.length > 0 && (
        <div className="mt-3">
          <strong>Comments:</strong>
          <ul className="list-group mt-1">
            {commentList.map((c, idx) => (
              <li key={idx} className="list-group-item py-1 px-2">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
