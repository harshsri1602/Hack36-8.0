import TrieNode from './TrieNode.js';

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(title, postId) {
        let node = this.root;
        for (let char of title.toLowerCase()) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEnd = true;
        node.posts.push({ title, postId }); // save post info
    }

    search(prefix) {
        let node = this.root;
        for (let char of prefix.toLowerCase()) {
            if (!node.children[char]) return []; // no match
            node = node.children[char];
        }
        return this._collectPosts(node);
    }

    _collectPosts(node) { // _ means that this function is private
        let result = [];

        if (node.isEnd) {
            result.push(...node.posts);
        }

        for (let char in node.children) {
            result.push(...this._collectPosts(node.children[char]));
        }

        return result;
    }

    delete(title, postId) {
        const deleteRecursively = (node, title, depth) => {
            if (!node) return false;

            if (depth === title.length) {
                if (!node.isEnd) return false;

                // Remove post from node.posts
                node.posts = node.posts.filter(p => p.postId !== postId);

                // If no posts left, mark isEnd false
                if (node.posts.length === 0) {
                    node.isEnd = false;
                }

                // If no children and no posts, delete this node
                return Object.keys(node.children).length === 0 && !node.isEnd;
            }

            const char = title[depth].toLowerCase();
            const shouldDeleteChild = deleteRecursively(node.children[char], title, depth + 1);

            if (shouldDeleteChild) {
                delete node.children[char];
                return Object.keys(node.children).length === 0 && !node.isEnd && node.posts.length === 0;
            }

            return false;
        };

        deleteRecursively(this.root, title, 0);
    }
}

export default Trie;
