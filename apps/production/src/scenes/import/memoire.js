import React from "react";
import { Container } from "reactstrap";
import { Mapping } from "pop-shared";
import Importer from "./importer";
import Memoire from "../../entities/Memoire";

import utils from "./utils";

export default class Import extends React.Component {
  render() {
    return (
      <Container className="import">
        <Importer
          collection="memoire"
          readme={readme}
          parseFiles={parseFiles}
          dropzoneText="Glissez & déposez vos fichiers au format mémoire ( extension .ods  ) et les images associées (au format .jpg) dans cette zone"
        />
      </Container>
    );
  }
}

function parseFiles(files, encoding) {
  return new Promise((resolve, reject) => {
    const errors = [];

    var objectFile = files.find(file => file.name.includes(".ods"));
    if (!objectFile) {
      reject("Pas de fichiers .ods detecté");
      return;
    }
    utils.readODS(objectFile).then(data => {
      const notices = [];
      for (let i = 0; i < data.length; i++) {
        notices.push(new Memoire(data[i]));
      }
      const filesMap = {};
      for (var i = 0; i < files.length; i++) {
        filesMap[convertLongNameToShort(files[i].name)] = files[i];
      }

      for (var i = 0; i < notices.length; i++) {
        if (!notices[i].IMG) break;
        const shortName = convertLongNameToShort(notices[i].IMG);
        let img = filesMap[shortName];
        if (!img) {
          notices[i]._errors.push(`Image ${shortName} introuvable`);
        } else {
          const newImage = utils.renameFile(img, shortName);
          notices[i]._images.push(newImage);
        }
      }
      resolve({ importedNotices: notices, fileNames: [objectFile.name] });
    });
  });
}

function convertLongNameToShort(str) {
  let name = str.substring(str.lastIndexOf("/") + 1);
  return name;
}

function readme() {
  const generatedFields = Object.keys(Mapping.memoire).filter(e => {
    return Mapping.memoire[e].generated;
  });
  const requiredFields = Object.keys(Mapping.memoire).filter(e => {
    return Mapping.memoire[e].required;
  });
  const controlsFields = Object.keys(Mapping.memoire).filter(e => {
    return Mapping.memoire[e].validation;
  });

  return (
    <div>
      <h5>Service archives photos</h5>
      <div>
        Cet onglet permet d’alimenter la base Mémoire pour la partie Archives
        photographiques. <br /> <br />
        <h6>Formats d’import </h6>
        Les formats de données pris en charge sont les suivants : <br />
        <ul>
          <li>texte : .ods (Open Office Document SpeardSheet) </li>
          <li>illustration : jpg, png.</li>
        </ul>
        La taille maximale d’un import est de 300Mo (soit environ 3000 notices
        avec image, ou 1 million de notices sans images). <br /> <br />
        <h6>Champs obligatoires et contrôles de vocabulaire </h6>
        Les champs suivants doivent obligatoirement être renseignés : <br />
        <br />
        <ul>
          {requiredFields.map(e => (
            <li>{e}</li>
          ))}
        </ul>
        <br />
        <h6>Test de validation des champs : </h6>
        Les tests suivants sont effectués lors des imports : <br />
        <br />
        <ul>
          {controlsFields.map(e => (
            <li>{e} : {Mapping.memoire[e].validation}</li>
          ))}
        </ul>
        <br />
        <h5>Que voulez-vous faire ?</h5>
        <h6>Je veux créer une notice :</h6>
        j’importe la notice.
        <br />
        <br />
        <h6>Je veux mettre à jour tout ou partie d’une notice :</h6>
        j’importe les champs à mettre à jour avec leurs nouvelles valeurs et
        j’écrase l’ancienne notice.
        <br />
        <br />
        <h6>Je veux effacer une ou plusieurs valeurs d’une notice : </h6>
        j’importe un fichier comportant le ou les champs que je veux supprimer
        en les laissant vides.
        <br />
        <br />
        <h6>Je veux supprimer une notice :</h6>
        je contacte l’administrateur de la base.
        <br />
        <br />
        <h6>Je veux ajouter une image :</h6>
        1) à l'import je renseigne le champ IMG ou NOMSN
        <br />
        2) sur une notice déjà existante, je peux cliquer sur "Ajouter une
        image" et télécharger une image depuis mon ordinateur. Le champ IMG
        contiendra le lien de l'image ainsi téléchargée.
        <br />
        <br />
        NB : à la création d'une notice, POP génère automatiquement certains
        champs utiles au traitement des données. Il s'agit des champs : <br />
        <ul>
          {generatedFields.map(e => (
            <li>{e}</li>
          ))}
        </ul>
        <br />
        Aucun besoin de les renseigner lors d'un import.
        <br />
        <br />
        <a
          href="https://github.com/betagouv/pop-api/blob/master/doc/memoire.md"
          target="_blank"
        >
          Lien vers le modèle de donnée Mémoire
        </a>
        <br />
      </div>
    </div>
  );
}