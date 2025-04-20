import PostModel from "../models/post.model.js";
import postTitleTrie from "./TrieIndex.js";

const rebuildTrieFromDB = async () => {
    try {
        const posts = await PostModel.find({}, 'title _id'); // only fetch needed fields
        for (const post of posts) {
            postTitleTrie.insert(post.title.toLowerCase(), post._id);
        }
        console.log('Trie rebuilt from DB');
    } catch (error) {
        console.error('Failed to rebuild Trie:', error);
    }
};

export default rebuildTrieFromDB;

