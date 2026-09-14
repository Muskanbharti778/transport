import React, {useMemo, useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {DatePickerModal} from '../../../components/common/DatePickerModal';
import {colors, radius, spacing} from '../../../theme';

const DOCUMENT_TYPES = [
  'RC Book',
  'Insurance',
  'Fitness Certificate',
  'Pollution Certificate',
  'Permit',
  'Driving License',
  'Aadhaar Card',
  'PAN Card',
  'Invoice',
  'E-Way Bill',
  'Other',
];

const LINK_TYPES = ['Truck', 'Driver', 'Trip'];

const INITIAL_DOCUMENTS = [
  {
    id: 'document-1',
    name: 'Truck Insurance',
    type: 'Insurance',
    linkedType: 'Truck',
    linkedName: 'Truck RJ14 AB 1234',
    mobile: '9876543210',
    expiryDate: '25 Dec 2026',
    fileUri: null,
    createdAt: '10 Sep 2026',
  },
];

function parseDate(dateString) {
  if (!dateString) return null;

  const match = dateString.match(
    /^(\d{1,2})\s([A-Za-z]{3})\s(\d{4})$/,
  );

  if (!match) return null;

  const months = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  return new Date(
    Number(match[3]),
    months[match[2]],
    Number(match[1]),
  );
}

function getDocumentStatus(expiryDate) {
  const expiry = parseDate(expiryDate);

  if (!expiry) {
    return {
      label: 'No expiry date',
      color: colors.textMuted,
      backgroundColor: colors.surfaceMuted,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const differenceInDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (differenceInDays < 0) {
    return {
      label: 'Expired',
      color: colors.danger,
      backgroundColor: colors.dangerSoft,
    };
  }

  if (differenceInDays <= 30) {
    return {
      label: 'Expiring soon',
      color: '#B45309',
      backgroundColor: '#FEF3C7',
    };
  }

  return {
    label: 'Valid',
    color: colors.success,
    backgroundColor: colors.successSoft,
  };
}

function getToday() {
  const today = new Date();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return `${today.getDate()} ${
    months[today.getMonth()]
  } ${today.getFullYear()}`;
}

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formVisible, setFormVisible] = useState(false);
  const [filePickerVisible, setFilePickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [documentType, setDocumentType] = useState('');
  const [linkedType, setLinkedType] = useState('Truck');
  const [documentName, setDocumentName] = useState('');
  const [linkedName, setLinkedName] = useState('');
  const [mobile, setMobile] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState(null);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter(document => {
      const matchesSearch =
        !query ||
        document.name.toLowerCase().includes(query) ||
        document.type.toLowerCase().includes(query) ||
        document.linkedName.toLowerCase().includes(query);

      const status = getDocumentStatus(document.expiryDate);
      const matchesStatus =
        statusFilter === 'All' || status.label === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, search, statusFilter]);

  const resetForm = () => {
    setDocumentType('');
    setLinkedType('Truck');
    setDocumentName('');
    setLinkedName('');
    setMobile('');
    setExpiryDate('');
    setFile(null);
  };

  const closeForm = () => {
    setFormVisible(false);
    resetForm();
  };

  const handleMobileChange = value => {
    const onlyNumbers = value.replace(/[^0-9]/g, '');

    if (onlyNumbers.length <= 10) {
      setMobile(onlyNumbers);
    }
  };

  const isValidMobile = /^[6-9][0-9]{9}$/.test(mobile);

  const validateForm = () => {
    if (!documentType) {
      Alert.alert('Missing details', 'Select a document type.');
      return false;
    }

    if (!documentName.trim()) {
      Alert.alert('Missing details', 'Enter a document name.');
      return false;
    }

    if (!linkedName.trim()) {
      Alert.alert(
        'Missing details',
        `Enter the ${linkedType.toLowerCase()} name or number.`,
      );
      return false;
    }

    if (mobile && !isValidMobile) {
      Alert.alert(
        'Invalid mobile number',
        'Enter a valid 10-digit mobile number starting from 6 to 9.',
      );
      return false;
    }

    if (expiryDate && parseDate(expiryDate) < new Date()) {
      Alert.alert(
        'Invalid expiry date',
        'Expiry date cannot be in the past.',
      );
      return false;
    }

    if (file && file.fileSize && file.fileSize > 5 * 1024 * 1024) {
      Alert.alert(
        'File too large',
        'Please select an image smaller than 5 MB.',
      );
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const newDocument = {
      id: `document-${Date.now()}`,
      name: documentName.trim(),
      type: documentType,
      linkedType,
      linkedName: linkedName.trim(),
      mobile: mobile || null,
      expiryDate: expiryDate || null,
      fileUri: file?.uri || null,
      createdAt: getToday(),
    };

    setDocuments(previousDocuments => [
      newDocument,
      ...previousDocuments,
    ]);

    closeForm();

    Alert.alert('Success', 'Document saved successfully.');
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    return true;
  };

  const takePhoto = async () => {
    setFilePickerVisible(false);

    const permissionGranted = await requestCameraPermission();

    if (!permissionGranted) {
      Alert.alert(
        'Permission required',
        'Camera permission is required to take a document photo.',
      );
      return;
    }

    const result = await launchCamera({
      mediaType: 'photo',
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.8,
      saveToPhotos: false,
    });

    if (result.didCancel || result.errorCode) return;

    const selectedFile = result.assets?.[0];

    if (selectedFile?.uri) {
      setFile(selectedFile);
    }
  };

  const chooseFromGallery = async () => {
    setFilePickerVisible(false);

    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.didCancel || result.errorCode) return;

    const selectedFile = result.assets?.[0];

    if (selectedFile?.uri) {
      setFile(selectedFile);
    }
  };

  return (
    <AppScreen>
      <View style={styles.header}>
        <View>
          <AppText variant="title">Documents</AppText>
          <AppText variant="body" color="textMuted">
            Manage vehicle, driver, and trip documents
          </AppText>
        </View>

        <TouchableOpacity
          style={styles.addIconButton}
          onPress={() => setFormVisible(true)}
          accessibilityLabel="Add document">
          <Icon name="plus" size={24} color={colors.onInk} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <SummaryItem
          label="Total"
          value={documents.length}
          icon="file-document-outline"
          color={colors.primary}
        />
        <SummaryItem
          label="Expiring"
          value={
            documents.filter(
              document =>
                getDocumentStatus(document.expiryDate).label ===
                'Expiring soon',
            ).length
          }
          icon="clock-alert-outline"
          color="#B45309"
        />
        <SummaryItem
          label="Expired"
          value={
            documents.filter(
              document =>
                getDocumentStatus(document.expiryDate).label ===
                'Expired',
            ).length
          }
          icon="alert-circle-outline"
          color={colors.danger}
        />
      </View>

      <View style={styles.searchBox}>
        <Icon
          name="magnify"
          size={21}
          color={colors.textMuted}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search documents"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />

        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon
              name="close-circle"
              size={19}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}>
        {['All', 'Valid', 'Expiring soon', 'Expired'].map(status => (
          <TouchableOpacity
            key={status}
            onPress={() => setStatusFilter(status)}
            style={[
              styles.filterButton,
              status === 'Expiring soon' && styles.expiringFilterButton,
              statusFilter === status && styles.activeFilterButton,
            ]}>
            <AppText
              variant="label"
              style={
                statusFilter === status
                  ? styles.activeFilterText
                  : styles.filterText
              }>
              {status}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.documentsSection}>
        <View style={styles.sectionHeader}>
          <AppText variant="heading">My Documents</AppText>
          <AppText variant="caption" color="textMuted">
            {filteredDocuments.length} documents
          </AppText>
        </View>

        {filteredDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="file-search-outline"
              size={42}
              color={colors.textMuted}
            />
            <AppText variant="body" color="textMuted">
              No documents found.
            </AppText>
          </View>
        ) : (
          filteredDocuments.map(document => (
            <DocumentRow
              key={document.id}
              document={document}
              onPress={() => setSelectedDocument(document)}
            />
          ))
        )}

        <AppButton
          title="Add document"
          onPress={() => setFormVisible(true)}
          style={styles.bottomButton}
        />
      </View>

      <DocumentFormModal
        visible={formVisible}
        onClose={closeForm}
        onSave={handleSave}
        documentType={documentType}
        setDocumentType={setDocumentType}
        linkedType={linkedType}
        setLinkedType={setLinkedType}
        documentName={documentName}
        setDocumentName={setDocumentName}
        linkedName={linkedName}
        setLinkedName={setLinkedName}
        mobile={mobile}
        handleMobileChange={handleMobileChange}
        isValidMobile={isValidMobile}
        expiryDate={expiryDate}
        onOpenDatePicker={() => setDatePickerVisible(true)}
        file={file}
        onOpenFilePicker={() => setFilePickerVisible(true)}
        onRemoveFile={() => setFile(null)}
      />

      <FilePickerModal
        visible={filePickerVisible}
        onClose={() => setFilePickerVisible(false)}
        onCamera={takePhoto}
        onGallery={chooseFromGallery}
      />

      <DatePickerModal
        visible={datePickerVisible}
        initialDate={expiryDate}
        title="Select expiry date"
        onSelectDate={setExpiryDate}
        onClose={() => setDatePickerVisible(false)}
      />

      <DocumentDetailsModal
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </AppScreen>
  );
}

function SummaryItem({label, value, icon, color}) {
  return (
    <View style={styles.summaryItem}>
      <Icon name={icon} size={21} color={color} />
      <AppText variant="heading" style={{color}}>
        {value}
      </AppText>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

function DocumentRow({document, onPress}) {
  const status = getDocumentStatus(document.expiryDate);

  return (
    <TouchableOpacity
      style={styles.documentRow}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.documentIcon}>
        <Icon
          name={document.fileUri ? 'file-image-outline' : 'file-document-outline'}
          size={24}
          color={colors.primary}
        />
      </View>

      <View style={styles.documentInfo}>
        <AppText variant="label">{document.name}</AppText>

        <AppText variant="caption" color="textMuted">
          {document.type} • {document.linkedName}
        </AppText>

        <AppText variant="caption" color="textMuted">
          Expiry: {document.expiryDate || 'Not added'}
        </AppText>
      </View>

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: status.backgroundColor},
          ]}>
          <AppText
            variant="caption"
            style={{color: status.color}}>
            {status.label}
          </AppText>
        </View>

        <Icon
          name="chevron-right"
          size={21}
          color={colors.textMuted}
        />
      </View>
    </TouchableOpacity>
  );
}

function DocumentFormModal({
  visible,
  onClose,
  onSave,
  documentType,
  setDocumentType,
  linkedType,
  setLinkedType,
  documentName,
  setDocumentName,
  linkedName,
  setLinkedName,
  mobile,
  handleMobileChange,
  isValidMobile,
  expiryDate,
  onOpenDatePicker,
  file,
  onOpenFilePicker,
  onRemoveFile,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.formSheet}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <View style={styles.modalHeader}>
                  <AppText variant="heading">
                    Add document
                  </AppText>

                  <TouchableOpacity onPress={onClose}>
                    <Icon
                      name="close"
                      size={24}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                </View>

                <AppText variant="label" color="textMuted">
                  Document type
                </AppText>

                <View style={styles.optionRow}>
                  {DOCUMENT_TYPES.map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setDocumentType(type)}
                      style={[
                        styles.optionButton,
                        documentType === type &&
                          styles.selectedOption,
                      ]}>
                      <AppText
                        variant="caption"
                        style={
                          documentType === type
                            ? styles.selectedOptionText
                            : null
                        }>
                        {type}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>

                <FormField
                  label="Document name"
                  value={documentName}
                  onChangeText={setDocumentName}
                  placeholder="e.g. Truck insurance 2026"
                />

                <AppText variant="label" color="textMuted">
                  Link document to
                </AppText>

                <View style={styles.typeRow}>
                  {LINK_TYPES.map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setLinkedType(type)}
                      style={[
                        styles.typeButton,
                        linkedType === type &&
                          styles.selectedTypeButton,
                      ]}>
                      <AppText
                        variant="label"
                        style={
                          linkedType === type
                            ? styles.selectedOptionText
                            : null
                        }>
                        {type}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>

                <FormField
                  label={`${linkedType} name or number`}
                  value={linkedName}
                  onChangeText={setLinkedName}
                  placeholder={
                    linkedType === 'Truck'
                      ? 'e.g. RJ14 AB 1234'
                      : `Enter ${linkedType.toLowerCase()} name`
                  }
                />

                <FormField
                  label="Mobile number (optional)"
                  value={mobile}
                  onChangeText={handleMobileChange}
                  placeholder="10-digit mobile number"
                  keyboardType="number-pad"
                  maxLength={10}
                />

                {mobile.length > 0 && !isValidMobile ? (
                  <AppText
                    variant="caption"
                    style={styles.errorText}>
                    Enter a valid 10-digit number starting from 6 to 9.
                  </AppText>
                ) : null}

                <TouchableOpacity
                  style={styles.dateField}
                  onPress={onOpenDatePicker}>
                  <View>
                    <AppText variant="caption" color="textMuted">
                      Expiry date
                    </AppText>
                    <AppText variant="body">
                      {expiryDate || 'Select expiry date'}
                    </AppText>
                  </View>

                  <Icon
                    name="calendar-month-outline"
                    size={22}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                {file ? (
                  <View style={styles.filePreview}>
                    <Image
                      source={{uri: file.uri}}
                      style={styles.previewImage}
                    />

                    <View style={styles.fileInfo}>
                      <AppText variant="label">
                        Document photo selected
                      </AppText>
                      <AppText variant="caption" color="textMuted">
                        Maximum size: 5 MB
                      </AppText>
                    </View>

                    <TouchableOpacity onPress={onRemoveFile}>
                      <Icon
                        name="delete-outline"
                        size={22}
                        color={colors.danger}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={onOpenFilePicker}>
                    <Icon
                      name="camera-plus-outline"
                      size={22}
                      color={colors.primary}
                    />
                    <AppText
                      variant="label"
                      style={styles.uploadText}>
                      Add document photo
                    </AppText>
                  </TouchableOpacity>
                )}

                <AppButton
                  title="Save document"
                  onPress={onSave}
                  style={styles.saveButton}
                />
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
}) {
  return (
    <View style={styles.field}>
      <AppText variant="label" color="textMuted">
        {label}
      </AppText>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={styles.input}
      />
    </View>
  );
}

function FilePickerModal({visible, onClose, onCamera, onGallery}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.filePickerCard}>
              <View style={styles.modalHeader}>
                <AppText variant="heading">
                  Add document photo
                </AppText>

                <TouchableOpacity onPress={onClose}>
                  <Icon
                    name="close"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.fileOption}
                onPress={onCamera}>
                <Icon
                  name="camera"
                  size={25}
                  color={colors.primary}
                />
                <View>
                  <AppText variant="label">
                    Take photo
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    Use the camera
                  </AppText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fileOption}
                onPress={onGallery}>
                <Icon
                  name="image-multiple"
                  size={25}
                  color={colors.success}
                />
                <View>
                  <AppText variant="label">
                    Choose from gallery
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    Select an existing image
                  </AppText>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function DocumentDetailsModal({document, onClose}) {
  if (!document) return null;

  const status = getDocumentStatus(document.expiryDate);

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.detailsSheet}>
          <View style={styles.modalHeader}>
            <View>
              <AppText variant="heading">
                {document.name}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {document.type}
              </AppText>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Icon
                name="close"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          {document.fileUri ? (
            <Image
              source={{uri: document.fileUri}}
              style={styles.detailImage}
            />
          ) : (
            <View style={styles.noPreview}>
              <Icon
                name="file-document-outline"
                size={44}
                color={colors.textMuted}
              />
              <AppText variant="caption" color="textMuted">
                No photo attached
              </AppText>
            </View>
          )}

          <DetailRow
            label="Linked to"
            value={`${document.linkedType}: ${document.linkedName}`}
          />

          <DetailRow
            label="Mobile"
            value={document.mobile || 'Not added'}
          />

          <DetailRow
            label="Expiry date"
            value={document.expiryDate || 'Not added'}
          />

          <View
            style={[
              styles.detailStatus,
              {backgroundColor: status.backgroundColor},
            ]}>
            <AppText
              variant="label"
              style={{color: status.color}}>
              {status.label}
            </AppText>
          </View>

          <AppButton
            title="Close"
            variant="secondary"
            onPress={onClose}
            style={styles.closeDetailsButton}
          />
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({label, value}) {
  return (
    <View style={styles.detailRow}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="label">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  addIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  searchBox: {
    minHeight: 48,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,

  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    marginLeft: spacing.sm,
    paddingVertical: 10,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.sm,
    marginTop: 15,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButton: {
    width: 76,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderRadius: 6,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expiringFilterButton: {
    width: 104,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  activeFilterText: {
    color: colors.onInk,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: 20,
  },
  documentsSection: {
    marginTop: -spacing.md,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.primarySoft,
  },
  documentInfo: {
    flex: 1,
    gap: 3,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['2xl'],
  },
  bottomButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  formSheet: {
    maxHeight: '92%',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  filePickerCard: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  detailsSheet: {
    minHeight: '60%',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  optionButton: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
  },
  selectedOption: {
    backgroundColor: colors.primarySoft,
  },
  selectedOptionText: {
    color: colors.primary,
  },
  field: {
    gap: 5,
    marginBottom: spacing.md,
  },
  input: {
    minHeight: 46,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  typeButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  selectedTypeButton: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  errorText: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    color: colors.danger,
  },
  dateField: {
    minHeight: 58,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  uploadButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.md,
  },
  uploadText: {
    color: colors.primary,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  previewImage: {
    width: 58,
    height: 58,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  fileInfo: {
    flex: 1,
    gap: 3,
  },
  saveButton: {
    marginBottom: spacing.md,
  },
  fileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  noPreview: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
  },
  detailImage: {
    width: '100%',
    height: 190,
    resizeMode: 'contain',
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
    borderRadius: 16,
  },
  closeDetailsButton: {
    marginTop: spacing.xl,
  },
});