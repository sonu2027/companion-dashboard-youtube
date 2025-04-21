import { Router } from "express";
import { videoData } from "../controllers/videodata.js";
import { updateTitleDescription } from "../controllers/updateTitleDescription.js";
import { postComment } from "../controllers/postComment.js";
import { deleteComment } from "../controllers/deleteComment.js";
import { postReply } from "../controllers/postReply.js";
import { deleteReply } from "../controllers/deleteReply.js";
import {addNotes} from "../controllers/addNotes.js";

const router = Router();

router.route("/video").get(videoData);
router.route("/video/update/titledescription").put(updateTitleDescription);
router.route("/video/comment").post(postComment);
router.route("/video/delete/comment").delete(deleteComment);
router.route("/video/reply").post(postReply);
router.route("/video/delete/reply").delete(deleteReply);
router.route("/notes").post(addNotes);

export default router;
