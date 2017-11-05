import { PROVIDERS } from 'constants/providers'
import { Card, CardHeader, Flexbox } from 'shared/components/elements'
import classes from './style.scss'

const AccountStatus = ({account, selected, onClick, height}) => {

  const permittedChannels = Helpers.permittedChannels(account)

  return (
    <Card selected={selected} onClick={onClick} height={height}>
      <CardHeader title={account.userName} subtitle={account.email} headerImgUrl={account.photoUrl}/>

      <label>Current Channel Types:</label>

      {permittedChannels.length ? (
        <div>
          {permittedChannels.map((channel) => (
            <div key={channel}>{channel.titleCase()}</div>
          ))}
        </div>
      ) : (
        <div>No permitted channels yet</div>
      )}
    </Card>
  )
}
export default AccountStatus
