import { tokenizeTweet } from '../../shared/lib/format'
import styles from './TweetPreview.module.css'

export function TweetText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`${styles.tweetText} ${className}`} data-testid="tweet-text">
      {tokenizeTweet(text).map((token, index) =>
        token.type === 'text' ? (
          <span key={index}>{token.value}</span>
        ) : (
          <span className={`${styles.linkText} ${styles[token.type]}`} data-token={token.type} key={index}>
            {token.value}
          </span>
        ),
      )}
    </div>
  )
}
