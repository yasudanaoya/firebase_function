/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions")
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

const admin = require("firebase-admin");

// Admin SDKでfireStoreを使う
admin.initializeApp(functions.config().firebase);

// データベースの参照を取得する
const fireStore = admin.firestore();

exports.getFirestore = onRequest((req, res) => {
  // パラメータを取得
  const params = req.body;
  // パラメータから任意のdocument IDを取得する
  const documentId = params.documentId;

  if (documentId) {
    // 'test'というcollectionの中の任意のdocumentに格納されているデータを取得する
    const testRef = fireStore.collection('test');
    testRef.doc(documentId).get().then((doc) => {
      if (doc.exists) {
        res.status(200).send(doc.data());
      } else {
        res.status(200).send("document not found");
      }
    });
  } else {
    res.status(400).send({errorMessaage: 'document id not found'});
  }
});

const validateParamsSchema = (params) => {
  const hasId = 'id' in params;
  const hasName = 'name' in params;
  const hasDocumentId = 'documentId' in params;

  return hasId && hasName && hasDocumentId;
};

// firestoreに任意のデータを保存する
exports.saveFirestore = onRequest((req, res) => {
  console.log(req.body)
  const params = req.body;
  // パラメータのスキーマのチェック
  if (!validateParamsSchema(params)) {
    res.status(400).send({errorMessaage: 'パラメータが不正です'});
  } else {
    const db = fireStore;
    // 'test'というcollectionがある前提で任意のドキュメントIDのdocumentを生成する
    db.doc(`test/${params.documentId}`).set({
      id: params.id,
      name: params.name,
    });

    db.collection('test').doc(params.documentId).get().then((doc) => {
      if (doc.exists) {
        res.status(200).send(doc.data());
      } else {
        res.status(200).send("document not found");
      }
    })
  }
});
