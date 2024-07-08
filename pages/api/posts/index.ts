import { promises as fs } from 'fs';
import path from 'path';

const postsFilePath = path.join(process.cwd(), 'data', 'posts.json');

export default async function handler(req: any, res: any) {
  switch (req.method) {
    case 'GET':
      const fileContents = await fs.readFile(postsFilePath, 'utf-8');
      const posts = JSON.parse(fileContents);
      res.status(200).json(posts);
      break;
    case 'POST':
      const newPost = req.body;
      const existingPosts = JSON.parse(await fs.readFile(postsFilePath, 'utf-8'));
      const updatedPosts = [...existingPosts, newPost];
      await fs.writeFile(postsFilePath, JSON.stringify(updatedPosts, null, 2));
      res.status(201).json(newPost);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
