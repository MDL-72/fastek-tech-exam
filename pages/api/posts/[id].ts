import { promises as fs } from 'fs';
import path from 'path';

const postsFilePath = path.join(process.cwd(), 'data', 'posts.json');

export default async function handler(req: any, res: any) {
  const { id } = req.query;
  const fileContents = await fs.readFile(postsFilePath, 'utf-8');
  const posts = JSON.parse(fileContents);
  const postIndex = posts.findIndex((post: any) => post.id === parseInt(id));

  switch (req.method) {
    case 'GET':
      if (postIndex > -1) {
        res.status(200).json(posts[postIndex]);
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
      break;
    case 'PUT':
      if (postIndex > -1) {
        posts[postIndex] = { ...posts[postIndex], ...req.body };
        await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2));
        res.status(200).json(posts[postIndex]);
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
      break;
    case 'DELETE':
      if (postIndex > -1) {
        const deletedPost = posts.splice(postIndex, 1);
        await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2));
        res.status(200).json(deletedPost);
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
