import Koa from 'koa';
import Router, { IRouterContext } from 'koa-router';
import { bodyParser } from "@koa/bodyparser";
const app = new Koa();
app.use(bodyParser());
const router = new Router();

let documents: any[] = [];

router.post('/documents', async (ctx: IRouterContext) => {

  const { title, content, creatorId } = (ctx.request as any).body;
  const newDocument = {
    id: documents.length + 1,
    title,
    content,
    creatorId,
    createdAt: new Date(),
    updatedAt: null,
    updateAuthorId: null,
    publishedVersion: null,
    versions: [],
  };
  documents.push(newDocument);
  ctx.body = newDocument;
});

router.post('/documents/:id/versions', async (ctx: IRouterContext) => {

  const { content, updateAuthorId } = (ctx.request as any).body;
  const documentId = parseInt(ctx.params.id);
  const documentIndex = documents.findIndex((doc) => doc.id === documentId);
  if (documentIndex !== -1) {
    documents[documentIndex].versions.push({
      content,
      updatedAt: new Date(),
      updateAuthorId,
    });
    ctx.body = documents[documentIndex];
  } else {
    ctx.status = 404;
    ctx.body = { message: 'Document not found' };
  }
});

router.put('/documents/:id', async (ctx: IRouterContext) => {
  const { content, updateAuthorId } = (ctx.request as any).body;
  const documentId = parseInt(ctx.params.id);
  const documentIndex = documents.findIndex((doc) => doc.id === documentId);
  if (documentIndex !== -1) {
    documents[documentIndex].versions[documents[documentIndex].versions.length - 1] = {
      content,
      updatedAt: new Date(),
      updateAuthorId,
    };
    ctx.body = documents[documentIndex];
  } else {
    ctx.status = 404;
    ctx.body = { message: 'Document not found' };
  }
});

router.post('/documents/:id/publish', async (ctx: IRouterContext) => {
  const documentId = parseInt(ctx.params.id);
  const documentIndex = documents.findIndex((doc) => doc.id === documentId);
  if (documentIndex !== -1) {
    const latestVersion = documents[documentIndex].versions[documents[documentIndex].versions.length - 1];
    documents[documentIndex].publishedVersion = latestVersion;
    ctx.body = documents[documentIndex];
  } else {
    ctx.status = 404;
    ctx.body = { message: 'Document not found' };
  }
});

router.get('/published-documents', async (ctx: IRouterContext) => {
  const publishedDocuments = documents.filter((doc) => doc.publishedVersion !== null);
  ctx.body = publishedDocuments;
});

router.get('/published-documents/:id', async (ctx: IRouterContext) => {
  const documentId = parseInt(ctx.params.id);
  const document = documents.find((doc) => doc.id === documentId && doc.publishedVersion !== null);
  if (document) {
    ctx.body = document.publishedVersion;
  } else {
    ctx.status = 404;
    ctx.body = { message: 'Published document not found' };
  }
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});