import React, { Component } from 'react';
import { render } from 'react-dom';
import $ from "jquery";

class Comment extends Component {
    render() {
        return (
            <div className="comment">
                <p className="comment-header">Author: {this.props.author}</p>
                <p className="comment-body">Comment: {this.props.body}</p>
                <div className="comemnt-footer">
                    <a href="#" onClick={this._handleDelete.bind(this)} className="comment-footer-delete">
                        Delete comment
                    </a>
                </div>
            </div>
        );
    }
    _handleDelete(event) {
        event.preventDefault();
        if (confirm('Are you sure?')) {
            this.props.onDelete(this.props.comment)
        }
    }
}

class CommentForm extends Component {
    _handleSubmit(event) {
        event.preventDefault();
        let author = this._author;
        let body = this._body;

        this.props.addComment(author.value, body.value);

    }

    render() {
        return (
            <form className="comment-form" onSubmit={this._handleSubmit.bind(this)}>
                <label>Join the discussion</label>
                <div className="comment-form-fields">
                    <input placeholder="Name:" ref={(input) => this._author = input}/>
                    <textarea placeholder="Comment:" ref={(textarea) => this._body = textarea}></textarea>
                </div>
                <div className="comment-form-actions">
                    <button type="submit">Post comment</button>
                </div>
            </form>
        )
    }
}

class CommentBox extends Component {
    constructor() {
        super();
        this.state = {
            showComments: false,
            comments: [
                // {id: 1, author: 'Alex kiura', body: 'Great app!'},
                // {id: 2, author: 'Steve Job', body: 'I couldn\'t agree more!'},
            ]
        };
    }
    componentDidMount() {
        this._timer = setInterval(() => this._fetchComments(), 5000);
    }

    componentWillUnmount() {
        clearInterval(this._timer);
    }

    render() {
        const comments = this._getComments();
        let commentNodes
        let buttonText = 'Show comments';
        if (this.state.showComments) {
            buttonText = 'Hide comments';
            commentNodes = <div className="comment-list">{comments}</div>;
        }
        return(
            <div className="comment-box">
                <CommentForm addComment={this._addComment.bind(this)}/>
                <h3>comments</h3>
                <h4 className="comment-count">
                    {this._getCommentsTitle(comments.length)}
                </h4>
                <button onClick={this._handleClick.bind(this)}>{buttonText}</button>
                {commentNodes}
            </div>
        );
    }

    _addComment(author, body) {
        const comment = {
            id:this.state.comments.length + 1,
            author,
            body
        };
        $.post('api/comments/', { comment})
            .success(newComment => {this.setState({comments})})
        this.setState({ comments: this.state.comments.concat([comment])})
    }
    _getComments() {
        return this.state.comments.map((comment) => {
            return (<Comment author={comment.author} body={comment.body} key={comment.id}
                comment={comment} onDelete={this._deleteComment.bind(this)}/>);
        });
    }

    _getCommentsTitle(commentCount) {
        if (commentCount === 0) {
            return 'No comments yet';
        } else if (commentCount === 1) {
            return '1 comment';
        } else {
            return `${commentCount} comments`;
        }
    }

    _handleClick() {
        this.setState({
            showComments: !this.state.showComments
        });
    }

    _fetchComments() {
        $.ajax({
            method: 'GET',
            url: '/api/comments',
            success: (comments) => {
                this.setState({ comments })
            }
        })
    }

    _deleteComment(comment) {
        $.ajax({
            method: 'DELETE',
            url: `/api/comments/${comment.id}`
        })
        const comments = [...this.state.comments];
        const commentIndex = comments.indexOf(comment)
        comments.splice(commentIndex, 1);

        this.setState({ comments })
    }
}

render(<CommentBox />, document.getElementById('story-app'));
