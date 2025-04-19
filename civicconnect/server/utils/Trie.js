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
}

export default Trie;
