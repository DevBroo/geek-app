import { List, Datagrid, TextField, NumberField, DateField, Show, SimpleShowLayout } from 'react-admin';

export const ReviewList = () => (
    <List>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="user" />
            <TextField source="product" />
            <NumberField source="rating" />
            <TextField source="comment" />
            <DateField source="date" />
        </Datagrid>
    </List>
);

export const ReviewShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="user" />
            <TextField source="product" />
            <NumberField source="rating" />
            <TextField source="comment" multiline />
            <DateField source="date" />
        </SimpleShowLayout>
    </Show>
);