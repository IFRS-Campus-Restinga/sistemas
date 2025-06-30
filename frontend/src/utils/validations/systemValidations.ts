import type { SystemFormErrors } from "../../pages/base/Admin/createSystem/CreateSystem";
import type { System } from "../../services/systemService";
import { validateMandatoryArrayField, validateMandatoryStringField } from "./generalValidations";

export const validateSystemForm = (formData: System) => {
    let errors: SystemFormErrors = {
        dev_team: null,
        groups: null,
        name: null,
        secret_key: null,
        system_url: null,
    }

    for (let field in formData) {
        switch (field) {
            case 'name':
                errors.name = validateMandatoryStringField(formData[field])
                break;
            case 'system_url':
                errors.system_url = validateMandatoryStringField(formData[field])
                break;
            case 'secret_key':
                errors.secret_key = validateMandatoryStringField(formData[field])
                break;
            case 'dev_team':
                errors.dev_team = validateMandatoryArrayField(formData[field], 'A equipe de desenvolvimento deve possuir ao menos 1 aluno')
                break;
            case 'groups':
                errors.groups = validateMandatoryArrayField(formData[field], 'O sistema deve possuir ao menos um grupo de acesso')
                break;
            default:
                break;
        }
    }

    return errors
}