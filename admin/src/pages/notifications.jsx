// Notifications
import { List, Datagrid, TextField, DateField, Show, SimpleShowLayout } from 'react-admin';

const NotificationList = () => (
    <List>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="recipient" />
            <TextField source="message" />
            <TextField source="status" />
            <DateField source="timestamp" showTime />
        </Datagrid>
    </List>
);
const NotificationShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="recipient" />
            <TextField source="message" multiline />
            <TextField source="status" />
            <DateField source="timestamp" showTime />
        </SimpleShowLayout>
    </Show>
);
export { NotificationList, NotificationShow };