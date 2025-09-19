// FAQs
import { List, Datagrid, TextField, EditButton, Edit, SimpleForm, TextInput, Create, required } from 'react-admin';

const FaqList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="question" />
            <TextField source="answer" />
            <EditButton />
        </Datagrid>
    </List>
);
const FaqEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput disabled source="id" />
            <TextInput source="question" validate={required()} />
            <TextInput source="answer" multiline validate={required()} />
        </SimpleForm>
    </Edit>
);
const FaqCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="question" validate={required()} />
            <TextInput source="answer" multiline validate={required()} />
        </SimpleForm>
    </Create>
);

export { FaqList, FaqEdit, FaqCreate };