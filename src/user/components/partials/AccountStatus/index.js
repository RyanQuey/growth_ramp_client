import { PROVIDERS } from 'constants/providers'
import { Card } from 'shared/components/elements'
import classes from './style.scss'

const AccountStatus = ({account, permittedChannels, selected, onClick}) => {
console.log(selected);
  return (
    <Card selected={selected} onClick={onClick}>
      <label>UserID:</label> <span>{account.providerUserId}</span>
      <label>Email:</label> <span>{account.email}</span>
      <label>Current Channel Types:</label>

      {permittedChannels.length ? (
        <div>
          {permittedChannels.map((channel) => (
            <div>{channel}</div>
          ))}
        </div>
      ) : (
        <div>No permitted channels yet</div>
      )}
    </Card>
  )
}
export default AccountStatus
