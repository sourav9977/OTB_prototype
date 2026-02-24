import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Download, Upload, ChevronLeft, Send, CornerUpLeft, CheckSquare, Check, BarChart3 } from 'lucide-react';

export default function ImpetusApp() {
  // Authentication and Brand Selection States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showBrandSelection, setShowBrandSelection] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('netplay');
  const [loginEmail, setLoginEmail] = useState('testuser@fynd.team');
  const [loginPassword, setLoginPassword] = useState('••••••••••••••••••');

  const [activeSubmenu, setActiveSubmenu] = useState('Project Config');
  const [intellInrExpanded, setIntellInrExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('Weekly');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOTB, setSelectedOTB] = useState('');
  const [userRole, setUserRole] = useState('Maker');
  const [otbView, setOtbView] = useState('snapshot');
  const [snapshotTab, setSnapshotTab] = useState('Creation');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Review Mode State for Target Cover Edits
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewChanges, setReviewChanges] = useState(null);
  // reviewChanges structure:
  // {
  //   columnIndex: 0,           // 0=W29, 1=W30, 2=W31
  //   columnName: 'W29',        // For display
  //   changes: {
  //     targetCover: { old: 8, new: 12 },
  //     targetInventory: { old: 6019, new: 106019 },
  //     otbUnits: { old: -1012.89, new: 98988 },
  //     otbCogs: { old: -765813.26, new: 74869531.88 }
  //   }
  // }

  // Sync snapshot tab with user role - navigate to default tab when role changes
  useEffect(() => {
    const getDefaultTabForRole = (role) => {
      const defaultTabs = {
        'Maker': 'Creation',
        'Checker': 'Review',
        'Approver': 'Approval'
      };
      return defaultTabs[role] || 'Creation';
    };
    
    setSnapshotTab(getDefaultTabForRole(userRole));
  }, [userRole]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    versionName: '',
    hit: '',
    drop: '',
    year: ''
  });
  const dropdownRef = useRef(null);

  // State for editable cells - split into Actual (read-only) and Projected (editable)
  const [additionalInwardsActual] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [additionalInwardsProjected, setAdditionalInwardsProjected] = useState([0, 0, 0]);
  const [targetCoverActual] = useState([8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
  const [targetCoverProjected, setTargetCoverProjected] = useState([8, 8, 8]);
  const [targetInventoryProjected, setTargetInventoryProjected] = useState([6019, 6019, 6019]);
  
  // State for OTB Units and COGS (Option A - Full state management)
  const [otbUnitsActual] = useState([-113450, -118423, -123099, -125748.50, -128628.33, -131662.89, -136457.89, -141186.89, 6019.11, 6019.11]);
  const [otbUnitsProjected, setOtbUnitsProjected] = useState([-1012.89, -8297.39, -12382.56]);
  const [otbCogsActual] = useState([-34207003.48, -35375361.87, -37021849.06, -37396368.25, -37903476.02, -39221436.13, -40993699.09, -42461009.17, 0, 0]);
  const [otbCogsProjected, setOtbCogsProjected] = useState([-765813.26, -6295195.29, -9441583.07]);
  
  const [editingCell, setEditingCell] = useState(null);
  const [tempInputValue, setTempInputValue] = useState('');

  // Toast state for access denied notification
  const [showAccessDeniedToast, setShowAccessDeniedToast] = useState(false);

  // State for Save/Undo/Redo functionality
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // State for confirmation dialogs
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Phase 1: Comment System - State Management
  const [comments, setComments] = useState({}); // Keyed by OTB ID
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    cellId: null,
    cellLabel: null
  });
  const [commentModal, setCommentModal] = useState({
    visible: false,
    mode: 'add', // 'add', 'edit', or 'reply'
    cellId: null,
    cellLabel: null,
    editingCommentId: null,
    existingText: '',
    parentId: null
  });
  const [sidePaneState, setSidePaneState] = useState({
    visible: false,
    highlightedCommentId: null,
    filterUserId: null
  });
  const [commentText, setCommentText] = useState('');
  const [highlightedCellId, setHighlightedCellId] = useState(null);

  // Current user context (based on selected role)
  const currentUser = {
    name: 'Sourav Nayak',
    role: userRole
  };

  // Convert otbList to state for dynamic updates
  const [otbList, setOtbList] = useState([
    { id: 'OTB_31_10_2025_120804', status: 'in_progress', createdBy: 'Sourav Nayak' },
    { id: 'OTB_01_10_2025_171500', status: 'change_requested', createdBy: 'Sourav Nayak' },
    { id: 'OTB_22_10_2025_190523', status: 'in_review', createdBy: 'Test User' },
    { id: 'OTB_17_10_2025_130922', status: 'change_requested', createdBy: 'Chinta Anusha' },
    { id: 'OTB_14_10_2025_123327', status: 'pending_approval', createdBy: 'Sourav Nayak' },
    { id: 'OTB_9_10_2025_120219_style data', status: 'approved', createdBy: 'Test User' },
    { id: 'OTB_8_10_2025_191623', status: 'in_progress', createdBy: 'Chinta Anusha' },
    { id: 'OTB_8_10_2025_175007', status: 'in_review', createdBy: 'Sourav Nayak' },
    { id: 'OTB_8_10_2025_154823_rk2', status: 'approved', createdBy: 'Test User' }
  ]);

  const otbSnapshotData = {
    'Creation': [
      ['OTB_31_10_2025_120804', 'H1', 'January', '31/10/25', '15/11/25', 'In Progress'],
      ['OTB_01_10_2025_171500', 'H1', 'January', '01/10/25', '15/10/25', 'Change Requested'],
      ['OTB_17_10_2025_130922', 'H1', 'January', '17/10/25', '31/10/25', 'Change Requested'],
      ['OTB_8_10_2025_191623', 'H1', 'January', '08/10/25', '22/10/25', 'In Progress']
    ],
    'Review': [
      ['OTB_22_10_2025_190523', 'H1', 'January', '22/10/25', '05/11/25', 'In Review'],
      ['OTB_8_10_2025_175007', 'H1', 'January', '08/10/25', '22/10/25', 'In Review']
    ],
    'Approval': [
      ['OTB_14_10_2025_123327', 'H1', 'January', '14/10/25', '28/10/25', 'Pending Approval']
    ],
    'Completed': [
      ['OTB_9_10_2025_120219_style data', 'H1', 'January', '09/10/25', '23/10/25', 'Approved'],
      ['OTB_8_10_2025_154823_rk2', 'H1', 'January', '08/10/25', '22/10/25', 'Approved']
    ],
    'Expired': []
  };

  const currentOTB = otbList.find(otb => otb.id === selectedOTB);
  const otbStatus = currentOTB?.status || '';

  const toggleIntellInr = () => {
    setIntellInrExpanded(!intellInrExpanded);
  };

  const handleSelectOTB = (otb) => {
    setSelectedOTB(otb.id);
    setDropdownOpen(false);
  };

  const getStatusConfig = (status) => {
    const configs = {
      'in_progress': { color: 'bg-gray-100 text-gray-700', label: 'In Progress' },
      'in_review': { color: 'bg-blue-100 text-blue-700', label: 'In Review' },
      'change_requested': { color: 'bg-yellow-100 text-yellow-700', label: 'Change Requested' },
      'pending_approval': { color: 'bg-orange-100 text-orange-700', label: 'Pending Approval' },
      'approved': { color: 'bg-green-100 text-green-700', label: 'Approved' },
      'expired': { color: 'bg-gray-100 text-gray-700', label: 'Expired' }
    };
    return configs[status] || configs['in_progress'];
  };

  const getStatusBadge = (statusText) => {
    const statusMap = {
      'In Progress': 'in_progress',
      'In Review': 'in_review',
      'Pending Approval': 'pending_approval',
      'Approved': 'approved',
      'Expired': 'expired'
    };
    const statusKey = statusMap[statusText] || 'in_progress';
    const config = getStatusConfig(statusKey);
    return config;
  };

  const handleOTBClick = (otbName) => {
    setSelectedOTB(otbName);
    setOtbView('detailed');
  };

  const getTabDescription = (tab) => {
    const descriptions = {
      'Creation': 'OTBs currently being drafted by makers. Once complete, submit for review.',
      'Review': 'OTBs submitted for review by checkers. Checkers can approve or request changes.',
      'Approval': 'OTBs pending final approval from approvers before becoming active.',
      'Completed': 'Approved OTBs that are finalized and ready for execution.',
      'Expired': 'OTBs that have passed their validity period or are no longer active.'
    };
    return descriptions[tab] || '';
  };

  const getActionButtons = (status, role) => {
    const actionConfig = {
      'in_progress': {
        buttons: [
          {
            text: 'Send for checker review',
            tooltip: 'Send for Review',
            icon: <Send className="w-4 h-4" />,
            action: 'send_to_checker',
            visible: role === 'Maker'
          }
        ]
      },
      'in_review': {
        buttons: [
          {
            text: 'Send for Approver review',
            tooltip: 'Send for Approval',
            icon: <CheckSquare className="w-4 h-4" />,
            action: 'send_to_approver',
            visible: role === 'Checker'
          },
          {
            text: 'Send for Maker correction',
            tooltip: 'Request Change',
            icon: <CornerUpLeft className="w-4 h-4" />,
            action: 'send_to_maker',
            visible: role === 'Checker'
          }
        ]
      },
      'change_requested': {
        buttons: [
          {
            text: 'Send for checker review',
            tooltip: 'Send for Review',
            icon: <Send className="w-4 h-4" />,
            action: 'send_to_checker',
            visible: role === 'Maker'
          }
        ]
      },
      'pending_approval': {
        buttons: [
          {
            text: 'Approve OTB',
            tooltip: 'Approve OTB',
            icon: <Check className="w-4 h-4" />,
            action: 'approve_otb',
            visible: role === 'Approver'
          }
        ]
      },
      'approved': {
        buttons: [
          {
            text: 'View OTB Breakup',
            tooltip: 'View OTB Breakup',
            icon: <span className="text-base">📊</span>,
            action: 'view_breakup',
            visible: true
          }
        ]
      }
    };

    const config = actionConfig[status];
    if (!config) return [];

    return config.buttons.filter(button => button.visible);
  };

  // Task D: Action Handlers
  const updateOTBStatus = (otbId, newStatus) => {
    setOtbList(prevList =>
      prevList.map(otb =>
        otb.id === otbId ? { ...otb, status: newStatus } : otb
      )
    );
  };

  const handleSendForCheckerReview = () => {
    updateOTBStatus(selectedOTB, 'in_review');
  };

  const handleSendForApproverReview = () => {
    updateOTBStatus(selectedOTB, 'pending_approval');
  };

  const handleSendForMakerCorrection = () => {
    updateOTBStatus(selectedOTB, 'change_requested');
  };

  const handleApproveOTB = () => {
    updateOTBStatus(selectedOTB, 'approved');
  };

  const handleViewOTBBreakup = () => {
    console.log('View OTB Breakup clicked for:', selectedOTB);
    alert('OTB Breakup view - Coming soon!');
  };

  const handleActionClick = (actionType) => {
    const actionHandlers = {
      'send_to_checker': handleSendForCheckerReview,
      'send_to_approver': handleSendForApproverReview,
      'send_to_maker': handleSendForMakerCorrection,
      'approve_otb': handleApproveOTB,
      'view_breakup': handleViewOTBBreakup
    };

    const handler = actionHandlers[actionType];
    if (handler) {
      handler();
    }
  };

  const handleOpenCreateDialog = () => {
    setShowCreateDialog(true);
    setCreateFormData({
      versionName: '',
      hit: '',
      drop: '',
      year: ''
    });
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
  };

  const handleFormChange = (field, value) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateOTBSubmit = () => {
    if (!createFormData.versionName || !createFormData.hit || 
        !createFormData.drop || !createFormData.year) {
      alert('Please fill all fields');
      return;
    }

    const newOTBId = `OTB_${createFormData.versionName}_${Date.now()}`;
    const newOTB = {
      id: newOTBId,
      status: 'in_progress',
      createdBy: 'Sourav Nayak'
    };

    setOtbList([newOTB, ...otbList]);
    setShowCreateDialog(false);
    
    alert(`OTB "${newOTBId}" created successfully!`);
  };

  // Helper functions for editable cells
  const isProjectedColumn = (colIndex) => {
    return colIndex >= 10; // Columns 10, 11, 12 are Projected
  };

  const getProjectedIndex = (colIndex) => {
    return colIndex - 10; // Convert table column index to projected array index
  };

  // Event handlers for editable cells
  const handleCellClick = (row, colIndex) => {
    // Only allow editing for Projected columns
    if (!isProjectedColumn(colIndex)) {
      return;
    }
    
    // Check if user has edit access (only Makers can edit Target Cover and Additional Inwards)
    if ((row === 'targetCover' || row === 'additionalInwards') && userRole !== 'Maker') {
      setShowAccessDeniedToast(true);
      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setShowAccessDeniedToast(false);
      }, 4000);
      return;
    }
    
    const projectedIndex = getProjectedIndex(colIndex);
    setEditingCell({ row, colIndex: projectedIndex });
    
    // Get current value based on row type
    const currentValue = row === 'additionalInwards' 
      ? additionalInwardsProjected[projectedIndex]
      : targetCoverProjected[projectedIndex];
      
    setTempInputValue(currentValue.toString());
  };

  const commitValue = (row, projectedIndex) => {
    let newValue = parseFloat(tempInputValue) || 0;
    
    // Task 6: Handle Target Cover with Review Mode
    if (row === 'targetCover') {
      // Validate input
      const validation = validateTargetCoverInput(newValue);
      if (!validation.isValid) {
        alert(validation.errors.join('\n'));
        return;
      }
      
      // Show warnings if any
      const warnings = validation.errors.filter(e => e.startsWith("Warning"));
      if (warnings.length > 0) {
        const proceed = window.confirm(warnings.join('\n') + '\n\nContinue?');
        if (!proceed) return;
      }
      
      // Get old value
      const oldValue = targetCoverProjected[projectedIndex];
      
      // Get current values for calculations
      const current = getCurrentValuesForColumn(projectedIndex);
      
      // Calculate new dependent values
      const calculated = calculateDependentValues(newValue, projectedIndex);
      
      // Prepare review data
      setReviewChanges({
        columnIndex: projectedIndex,
        columnName: `W${29 + projectedIndex}`, // W29, W30, or W31
        changes: {
          targetCover: { 
            old: oldValue, 
            new: newValue 
          },
          targetInventory: { 
            old: current.targetInventory, 
            new: calculated.targetInventory 
          },
          otbUnits: { 
            old: current.otbUnits, 
            new: calculated.otbUnits 
          },
          otbCogs: { 
            old: current.otbCogs, 
            new: calculated.otbCogs 
          }
        }
      });
      
      // Enter review mode (don't save yet)
      setReviewMode(true);
      setEditingCell(null);
      setTempInputValue('');
      
      return; // Exit without saving
    }
    
    // Step 2: Handle Additional Inwards with Review Mode
    if (row === 'additionalInwards') {
      // Validate input
      const validation = validateAdditionalInwardsInput(newValue);
      if (!validation.isValid) {
        alert(validation.errors.join('\n'));
        return;
      }
      
      // Show warnings if any
      const warnings = validation.errors.filter(e => e.startsWith("Warning"));
      if (warnings.length > 0) {
        const proceed = window.confirm(warnings.join('\n') + '\n\nContinue?');
        if (!proceed) return;
      }
      
      // Get old value
      const oldValue = additionalInwardsProjected[projectedIndex];
      
      // Get current values for calculations
      const current = getCurrentValuesForColumn(projectedIndex);
      
      // Calculate dependent values (OTB Units, OTB COGS only)
      const calculated = calculateDependentValuesForAdditionalInwards(newValue, projectedIndex);
      
      // Prepare review data (3 KPIs instead of 4)
      setReviewChanges({
        columnIndex: projectedIndex,
        columnName: `W${29 + projectedIndex}`,
        changes: {
          additionalInwards: { 
            old: oldValue, 
            new: newValue 
          },
          otbUnits: { 
            old: current.otbUnits, 
            new: calculated.otbUnits 
          },
          otbCogs: { 
            old: current.otbCogs, 
            new: calculated.otbCogs 
          }
        }
      });
      
      // Enter review mode
      setReviewMode(true);
      setEditingCell(null);
      setTempInputValue('');
      
      return; // Exit without saving
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setTempInputValue('');
  };

  const handleKeyDown = (e, row, projectedIndex) => {
    if (e.key === 'Enter') {
      commitValue(row, projectedIndex);
    } else if (e.key === 'Escape') {
      cancelEdit();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      commitValue(row, projectedIndex);
      // Move to next cell (only within projected columns 0-2)
      if (projectedIndex < 2) {
        setTimeout(() => {
          handleCellClick(row, projectedIndex + 10);
        }, 0);
      }
    }
  };

  const handleCellBlur = (row, projectedIndex) => {
    setTimeout(() => {
      if (editingCell) {
        commitValue(row, projectedIndex);
      }
    }, 100);
  };

  // Task 2: Action Logic Function for OTB Snapshot
  const getSnapshotActions = (tab, status, role) => {
    const actionRules = {
      'Creation': {
        'Maker': [
          { action: 'send_review', label: 'Send for Review', condition: (s) => s === 'In Progress' || s === 'Change Requested' }
        ],
        'Checker': [],
        'Approver': []
      },
      'Review': {
        'Maker': [],
        'Checker': [
          { action: 'send_approval', label: 'Send for Approval', condition: (s) => s === 'In Review' },
          { action: 'request_change', label: 'Request Change', condition: (s) => s === 'In Review' }
        ],
        'Approver': []
      },
      'Approval': {
        'Maker': [],
        'Checker': [],
        'Approver': [
          { action: 'approve', label: 'Approve OTB', condition: (s) => s === 'Pending Approval' }
        ]
      },
      'Completed': {
        'Maker': [
          { action: 'view_breakup', label: 'View Breakup', condition: (s) => s === 'Approved' }
        ],
        'Checker': [
          { action: 'view_breakup', label: 'View Breakup', condition: (s) => s === 'Approved' }
        ],
        'Approver': [
          { action: 'view_breakup', label: 'View Breakup', condition: (s) => s === 'Approved' }
        ]
      },
      'Expired': {
        'Maker': [],
        'Checker': [],
        'Approver': []
      }
    };

    const actions = actionRules[tab]?.[role] || [];
    
    // Filter actions based on conditions
    return actions.filter(action => {
      if (action.condition) {
        return action.condition(status);
      }
      return true;
    });
  };

  // Task 3: Icon Mapping Function
  const getActionIcon = (actionType) => {
    const iconMap = {
      'send_review': <Send className="w-4 h-4 text-blue-600" />,
      'request_change': <CornerUpLeft className="w-4 h-4 text-orange-600" />,
      'send_approval': <CheckSquare className="w-4 h-4 text-blue-600" />,
      'approve': <Check className="w-4 h-4 text-green-600" />,
      'view_breakup': <BarChart3 className="w-4 h-4 text-blue-600" />
    };
    return iconMap[actionType] || null;
  };

  // Task 5: Basic Action Handler (without confirmations)
  const handleSnapshotAction = (actionType, otbName) => {
    // Handle View Breakup action separately (no confirmation needed)
    if (actionType === 'view_breakup') {
      console.log('View OTB Breakup clicked for:', otbName);
      alert('OTB Breakup view - Coming soon!');
      return;
    }

    // Get action configuration for other actions
    const actionConfig = {
      'send_review': {
        message: 'Would you like to send this OTB for review?',
        disclaimer: null,
        successMessage: 'OTB sent for review successfully',
        newStatus: 'in_review'
      },
      'send_approval': {
        message: 'Would you like to send this OTB for approval?',
        disclaimer: null,
        successMessage: 'OTB sent for approval successfully',
        newStatus: 'pending_approval'
      },
      'request_change': {
        message: 'Would you like to send this OTB back for review?',
        disclaimer: null,
        successMessage: 'Change request sent successfully',
        newStatus: 'change_requested'
      },
      'approve': {
        message: 'Would you like to approve this OTB?',
        disclaimer: 'Note: This action cannot be reversed upon completion',
        successMessage: 'OTB approved successfully',
        newStatus: 'approved'
      }
    };

    const config = actionConfig[actionType];
    if (!config) return;

    // Show confirmation dialog
    setConfirmDialogConfig({
      otbName: otbName,
      actionType: actionType,
      message: config.message,
      disclaimer: config.disclaimer,
      successMessage: config.successMessage,
      newStatus: config.newStatus
    });
    setShowConfirmDialog(true);
  };

  // Handle "Proceed" button in confirmation dialog
  const handleProceedAction = () => {
    if (!confirmDialogConfig) return;

    const { otbName, newStatus, successMessage } = confirmDialogConfig;

    // Update OTB status
    updateOTBStatus(otbName, newStatus);

    // Close dialog
    setShowConfirmDialog(false);

    // Show success toast
    setSuccessMessage(successMessage);
    setShowSuccessToast(true);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);

    // Clear config
    setConfirmDialogConfig(null);
  };

  // Handle "View OTB" or "Go Back" button in confirmation dialog
  const handleViewOTBFromDialog = () => {
    if (!confirmDialogConfig) return;

    const { otbName } = confirmDialogConfig;

    // Close dialog
    setShowConfirmDialog(false);
    setConfirmDialogConfig(null);

    // If in snapshot view, navigate to detailed view
    if (otbView === 'snapshot') {
      setSelectedOTB(otbName);
      setOtbView('detailed');
    } else {
      // If already in detailed view, go back to snapshot
      setOtbView('snapshot');
    }
  };

  // Handle dialog close
  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false);
    setConfirmDialogConfig(null);
  };

  // Context-Aware Actions Column Visibility
  const shouldShowActionsColumn = (tab, role) => {
    // Always hide in Expired tab (no actions available)
    if (tab === 'Expired') {
      return false;
    }
    
    const columnVisibilityRules = {
      'Maker': ['Creation', 'Completed'],
      'Checker': ['Review', 'Completed'],
      'Approver': ['Approval', 'Completed']
    };
    
    const allowedTabs = columnVisibilityRules[role] || [];
    return allowedTabs.includes(tab);
  };

  // Get Date Column Header based on tab
  const getDateColumnHeader = (tab) => {
    const headers = {
      'Completed': 'Approved On',
      'Expired': 'Expired On',
      'Creation': 'Expiring On',
      'Review': 'Expiring On',
      'Approval': 'Expiring On'
    };
    return headers[tab] || 'Expiring On';
  };

  // Task 3: Data Access Helper - Get current values for a projected column
  const getCurrentValuesForColumn = (projectedIndex) => {
    // Projected index: 0=W29, 1=W30, 2=W31
    // Table column index: 10=W29, 11=W30, 12=W31
    
    // Current values from state
    return {
      targetCover: targetCoverProjected[projectedIndex],
      targetInventory: targetInventoryProjected[projectedIndex],
      openingStock: 0, // From mock data - currently static
      plannedInwards: projectedIndex === 0 ? 7032 : (projectedIndex === 1 ? 7285 : 4085), // From Planned Inwards row
      additionalInwards: additionalInwardsProjected[projectedIndex],
      cyCogs: projectedIndex === 0 ? 756.07 : (projectedIndex === 1 ? 758.70 : 762.49), // From CY COGS row
      otbUnits: otbUnitsProjected[projectedIndex],
      otbCogs: otbCogsProjected[projectedIndex]
    };
  };

  // Task 4: Calculation Function - Calculate dependent values when Target Cover changes
  const calculateDependentValues = (newTargetCover, projectedIndex) => {
    // Get current values
    const current = getCurrentValuesForColumn(projectedIndex);
    
    // Rule 1: Calculate Target Inventory
    // Formula: User input + 100,000 (standard value)
    const newTargetInventory = newTargetCover + 100000;
    
    // Rule 2: Calculate OTB Units
    // Formula: Target Inventory - Opening Stock - Planned Inwards - Additional Inwards
    const newOtbUnits = newTargetInventory 
      - current.openingStock 
      - current.plannedInwards 
      - current.additionalInwards;
    
    // Rule 3: Calculate OTB COGS
    // Formula: OTB Units × CY COGS
    const newOtbCogs = newOtbUnits * current.cyCogs;
    
    return {
      targetInventory: Math.round(newTargetInventory), // 0 decimals for quantities
      otbUnits: Math.round(newOtbUnits), // 0 decimals for quantities
      otbCogs: parseFloat(newOtbCogs.toFixed(2)) // 2 decimals for currency
    };
  };

  // Task 5: Validation Function - Validate Target Cover input
  const validateTargetCoverInput = (value) => {
    const errors = [];
    
    // Check negative
    if (value < 0) {
      errors.push("Target Cover cannot be negative");
    }
    
    // Check if zero
    if (value === 0) {
      errors.push("Target Cover cannot be zero");
    }
    
    // Warning for unusually high values (over 1 year)
    if (value > 52) {
      errors.push("Warning: Target Cover above 52 weeks (1 year) is unusual");
    }
    
    return {
      isValid: errors.filter(e => !e.startsWith("Warning")).length === 0,
      errors: errors
    };
  };

  // Step 1: Validation Function for Additional Inwards
  const validateAdditionalInwardsInput = (value) => {
    const errors = [];
    
    // Check negative
    if (value < 0) {
      errors.push("Additional Inwards cannot be negative");
    }
    
    // Warning for unusually high values
    if (value > 50000) {
      errors.push("Warning: Additional Inwards above 50,000 units is unusual");
    }
    
    return {
      isValid: errors.filter(e => !e.startsWith("Warning")).length === 0,
      errors: errors
    };
  };

  // Step 1: Calculation Function for Additional Inwards
  const calculateDependentValuesForAdditionalInwards = (newAdditionalInwards, projectedIndex) => {
    // Get current values
    const current = getCurrentValuesForColumn(projectedIndex);
    
    // Rule 1: Calculate OTB Units
    // Formula: Target Inventory - Opening Stock - Planned Inwards - Additional Inwards
    const newOtbUnits = current.targetInventory 
      - current.openingStock 
      - current.plannedInwards 
      - newAdditionalInwards;
    
    // Rule 2: Calculate OTB COGS
    // Formula: OTB Units × CY COGS
    const newOtbCogs = newOtbUnits * current.cyCogs;
    
    return {
      otbUnits: Math.round(newOtbUnits), // 0 decimals
      otbCogs: parseFloat(newOtbCogs.toFixed(2)) // 2 decimals
    };
  };

  const getWorkflowStep = (status) => {
    const steps = {
      'in_progress': 1,
      'in_review': 2,
      'change_requested': 2,
      'pending_approval': 3,
      'approved': 4
    };
    return steps[status] || 1;
  };

  const currentStep = getWorkflowStep(otbStatus);

  // Task 9: Helper Functions for Review Modal
  const formatKpiName = (kpi) => {
    const names = {
      targetCover: 'Target Cover (in weeks)',
      targetInventory: 'Target Inventory (Qty)',
      otbUnits: 'OTB Units (Qty)',
      otbCogs: 'OTB COGS (INR)'
    };
    return names[kpi] || kpi;
  };

  const formatValue = (kpi, value) => {
    if (kpi === 'otbCogs') {
      return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return value.toLocaleString('en-IN');
  };

  const calculatePercentChange = (oldVal, newVal) => {
    const change = ((newVal - oldVal) / Math.abs(oldVal)) * 100;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  // Phase 1: Comment System - Helper Functions
  
  // Generate unique cell ID
  const generateCellId = (rowName, columnIndex, isProjected) => {
    const colName = `W${19 + columnIndex}`;
    const section = isProjected ? 'projected' : 'actual';
    return `${rowName}-${colName}-${section}`;
  };

  // Generate human-readable cell label
  const generateCellLabel = (rowName, columnIndex, isProjected) => {
    const colName = `W${19 + columnIndex}`;
    const section = isProjected ? 'Projected' : 'Actual';
    const displayNameMap = {
      'netSalesAOP': 'AOP Net Sales',
      'netSalesCY': 'CY Net Sales',
      'netSalesLY': 'LY Net Sales',
      'achievementAOP': 'Achievement Against AOP',
      'changeLY': 'Change Over LY',
      'mrpAOP': 'AOP MRP',
      'mrpCY': 'CY MRP',
      'mrpLY': 'LY MRP',
      'discountAOP': 'AOP Discount',
      'discountCY': 'CY Discount',
      'discountLY': 'LY Discount',
      'aspAOP': 'AOP ASP',
      'aspCY': 'CY ASP',
      'aspLY': 'LY ASP',
      'unitSalesAOP': 'AOP Unit Sales',
      'unitSalesCY': 'CY Unit Sales',
      'unitSalesLY': 'LY Unit Sales',
      'unitAchievementAOP': 'Achievement Against AOP (Units)',
      'unitChangeLY': 'Change Over LY (Units)',
      'targetInventory': 'Target Inventory',
      'openingStock': 'Opening Stock',
      'plannedInwards': 'Planned Inwards',
      'additionalInwards': 'Additional Inwards',
      'actualCover': 'Actual Cover',
      'targetCover': 'Target Cover',
      'lyCover': 'LY Cover',
      'coverVariance': 'Cover Variance',
      'marginAOP': 'AOP Margin',
      'marginCY': 'CY Margin',
      'marginLY': 'LY Margin',
      'cogsAOP': 'AOP COGS',
      'cogsCY': 'CY COGS',
      'cogsLY': 'LY COGS',
      'otbUnits': 'OTB Units',
      'otbCogs': 'OTB COGS'
    };
    const displayName = displayNameMap[rowName] || rowName;
    return `${displayName} - ${colName} (${section})`;
  };

  // Get comments for current OTB
  const getCurrentComments = () => {
    return comments[selectedOTB] || [];
  };

  // Get comments for specific cell
  const getCellComments = (cellId) => {
    return getCurrentComments().filter(c => c.cellId === cellId && !c.parentId);
  };

  // Check if cell has comments
  const cellHasComments = (cellId) => {
    return getCellComments(cellId).length > 0;
  };

  // Get replies for a comment
  const getReplies = (parentId) => {
    return getCurrentComments()
      .filter(c => c.parentId === parentId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  // Add new comment
  const addComment = (cellId, cellLabel, text, parentId = null) => {
    const newComment = {
      id: Date.now().toString(),
      otbId: selectedOTB,
      cellId,
      cellLabel,
      text,
      author: currentUser.name,
      role: currentUser.role,
      sessionId: sessionId, // Track which session created this comment
      timestamp: new Date().toISOString(),
      edited: false,
      editedAt: null,
      parentId
    };
    
    setComments(prev => ({
      ...prev,
      [selectedOTB]: [...(prev[selectedOTB] || []), newComment]
    }));
  };

  // Update comment
  const updateComment = (commentId, newText) => {
    setComments(prev => ({
      ...prev,
      [selectedOTB]: prev[selectedOTB].map(c => 
        c.id === commentId 
          ? { ...c, text: newText, edited: true, editedAt: new Date().toISOString() }
          : c
      )
    }));
  };

  // Delete comment (and all its replies)
  const deleteComment = (commentId) => {
    setComments(prev => ({
      ...prev,
      [selectedOTB]: prev[selectedOTB].filter(c => c.id !== commentId && c.parentId !== commentId)
    }));
  };

  // Format timestamp
  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get filtered comments for side pane
  const getFilteredComments = () => {
    let filteredComments = getCurrentComments().filter(c => !c.parentId); // Top-level only
    
    if (sidePaneState.filterUserId) {
      filteredComments = filteredComments.filter(c => c.author === sidePaneState.filterUserId);
    }
    
    // Sort by timestamp (newest first)
    return filteredComments.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  // Task 2.1: Group comments by cell
  const getCommentsGroupedByCell = () => {
    const allComments = getCurrentComments();
    const grouped = {};
    
    allComments.forEach(comment => {
      if (!grouped[comment.cellId]) {
        grouped[comment.cellId] = {
          cellLabel: comment.cellLabel,
          comments: []
        };
      }
      grouped[comment.cellId].comments.push(comment);
    });
    
    // Sort comments within each cell by timestamp (newest first)
    Object.keys(grouped).forEach(cellId => {
      grouped[cellId].comments.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
    });
    
    return grouped;
  };

  // Task 2.1: State for collapsible cell sections
  const [expandedCells, setExpandedCells] = useState({});

  const toggleCellExpansion = (cellId) => {
    setExpandedCells(prev => ({
      ...prev,
      [cellId]: !prev[cellId]
    }));
  };

  // Phase 3: Context Menu Handlers
  const handleCellRightClick = (e, cellId, cellLabel) => {
    e.preventDefault(); // Prevent default browser context menu
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      cellId,
      cellLabel
    });
  };

  const handleAddRemarkClick = () => {
    setCommentModal({
      visible: true,
      mode: 'add',
      cellId: contextMenu.cellId,
      cellLabel: contextMenu.cellLabel,
      editingCommentId: null,
      existingText: '',
      parentId: null
    });
    setCommentText(''); // Clear any existing text
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleViewRemarksClick = () => {
    setSidePaneState({
      visible: true,
      highlightedCommentId: getCellComments(contextMenu.cellId)[0]?.id || null,
      filterUserId: null
    });
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleRemoveRemarksClick = () => {
    // Open side pane filtered to current user's comments
    setSidePaneState({
      visible: true,
      highlightedCommentId: null,
      filterUserId: currentUser.name
    });
    setContextMenu({ ...contextMenu, visible: false });
  };

  // Task 1.2: Edit Comment Handler
  const handleEditComment = (comment) => {
    setCommentModal({
      visible: true,
      mode: 'edit',
      cellId: comment.cellId,
      cellLabel: comment.cellLabel,
      editingCommentId: comment.id,
      existingText: comment.text,
      parentId: null
    });
    setCommentText(comment.text); // Pre-populate with existing text
  };

  // Task 1.2: Delete Comment Handler with Confirmation
  const handleDeleteComment = (commentId, event) => {
    // Stop event propagation to prevent modal issues
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    const confirmed = window.confirm('Are you sure you want to delete this comment? This action cannot be undone.');
    if (confirmed) {
      deleteComment(commentId);
      // Refresh modal to show updated comment list
      if (commentModal.mode === 'add') {
        // Force re-render by toggling modal
        const currentCellId = commentModal.cellId;
        const currentCellLabel = commentModal.cellLabel;
        setCommentModal(prev => ({ ...prev, visible: false }));
        setTimeout(() => {
          setCommentModal({
            visible: true,
            mode: 'add',
            cellId: currentCellId,
            cellLabel: currentCellLabel,
            editingCommentId: null,
            existingText: '',
            parentId: null
          });
        }, 50);
      }
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible]);

  // Phase 4: Comment Modal Handlers
  const commentTextareaRef = useRef(null);

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (commentModal.visible && commentTextareaRef.current) {
      commentTextareaRef.current.focus();
      if (commentModal.existingText) {
        setCommentText(commentModal.existingText);
      }
    }
  }, [commentModal.visible]);

  // Task 1.1: Complete Add Comment Modal
  const handleCommentSubmit = () => {
    // Validate: don't allow empty comments
    if (commentText.trim().length === 0) {
      alert('Comment cannot be empty');
      return;
    }
    
    if (commentModal.mode === 'add') {
      // Add new comment with timestamp
      addComment(
        commentModal.cellId, 
        commentModal.cellLabel, 
        commentText.trim(),
        null // No parent for sequential comments
      );
      // Clear and close
      setCommentText('');
      setCommentModal({ ...commentModal, visible: false });
    } else if (commentModal.mode === 'edit') {
      // Task 1.2: Update existing comment with edited flag
      updateComment(commentModal.editingCommentId, commentText.trim());
      
      // Issue 3 Fix: After edit, switch back to 'add' mode to show updated comments
      const currentCellId = commentModal.cellId;
      const currentCellLabel = commentModal.cellLabel;
      setCommentText('');
      
      // Switch to add mode to show the updated comment in the list
      setCommentModal({
        visible: true,
        mode: 'add',
        cellId: currentCellId,
        cellLabel: currentCellLabel,
        editingCommentId: null,
        existingText: '',
        parentId: null
      });
    }
  };

  const handleCommentCancel = () => {
    setCommentText('');
    setCommentModal({ ...commentModal, visible: false });
  };

  // Task 11: Save Changes Handler
  const handleSaveChanges = () => {
    const { columnIndex, changes } = reviewChanges;
    
    // Step 4: Dynamic save - Update only the KPIs that are present in changes object
    if (changes.targetCover) {
      const newTargetCover = [...targetCoverProjected];
      newTargetCover[columnIndex] = changes.targetCover.new;
      setTargetCoverProjected(newTargetCover);
    }
    
    if (changes.targetInventory) {
      const newTargetInventory = [...targetInventoryProjected];
      newTargetInventory[columnIndex] = changes.targetInventory.new;
      setTargetInventoryProjected(newTargetInventory);
    }
    
    if (changes.additionalInwards) {
      const newAdditionalInwards = [...additionalInwardsProjected];
      newAdditionalInwards[columnIndex] = changes.additionalInwards.new;
      setAdditionalInwardsProjected(newAdditionalInwards);
    }
    
    // Always update OTB Units and COGS (both edit types affect these)
    if (changes.otbUnits) {
      const newOtbUnits = [...otbUnitsProjected];
      newOtbUnits[columnIndex] = changes.otbUnits.new;
      setOtbUnitsProjected(newOtbUnits);
    }
    
    if (changes.otbCogs) {
      const newOtbCogs = [...otbCogsProjected];
      newOtbCogs[columnIndex] = changes.otbCogs.new;
      setOtbCogsProjected(newOtbCogs);
    }
    
    // Exit review mode
    setReviewMode(false);
    setReviewChanges(null);
    
    // Mark as unsaved
    setHasUnsavedChanges(true);
    
    // Success message with dynamic count
    const kpiCount = Object.keys(changes).length;
    alert(`Changes saved successfully! ${kpiCount} metrics have been updated.`);
  };

  // Save OTB Handler (for Save button)
  const handleSaveOTB = () => {
    // Mark as saved
    setHasUnsavedChanges(false);
    
    // Show saved toast
    setShowSavedToast(true);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setShowSavedToast(false);
    }, 3000);
  };

  // Undo Handler (placeholder)
  const handleUndo = () => {
    // Placeholder - no functionality yet
    console.log('Undo clicked - functionality coming soon');
  };

  // Redo Handler (placeholder)
  const handleRedo = () => {
    // Placeholder - no functionality yet
    console.log('Redo clicked - functionality coming soon');
  };

  // Navigation handlers with unsaved changes check
  const handleBackToSnapshot = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation('snapshot');
      setShowUnsavedWarning(true);
    } else {
      setOtbView('snapshot');
    }
  };

  const handleProceedWithoutSaving = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedWarning(false);
    
    // Execute pending navigation
    if (pendingNavigation === 'snapshot') {
      setOtbView('snapshot');
    }
    setPendingNavigation(null);
  };

  const handleSaveAndProceed = () => {
    handleSaveOTB();
    setShowUnsavedWarning(false);
    
    // Execute pending navigation after save
    setTimeout(() => {
      if (pendingNavigation === 'snapshot') {
        setOtbView('snapshot');
      }
      setPendingNavigation(null);
    }, 100);
  };

  const handleCancelNavigation = () => {
    setShowUnsavedWarning(false);
    setPendingNavigation(null);
  };

  // Login and Brand Selection Handlers
  const handleLogin = () => {
    console.log('🔵 handleLogin called');
    // For prototype, accept any credentials
    console.log('🔵 Setting isAuthenticated to true');
    setIsAuthenticated(true);
    console.log('🔵 Setting showBrandSelection to true');
    setShowBrandSelection(true);
    console.log('🔵 handleLogin completed');
  };

  const handleBrandSelect = (brandId) => {
    setSelectedBrand(brandId);
  };

  const handleBrandChange = (e) => {
    const newBrand = e.target.value;
    console.log('🔵 Brand changed to:', newBrand);
    setSelectedBrand(newBrand);
    // For prototype, all brands show the same OTB Planning screen
  };

  const handleBrandContinue = () => {
    console.log('🔵 handleBrandContinue called');
    console.log('🔵 Selected brand:', selectedBrand);
    if (selectedBrand) {
      console.log('🔵 Brand selected, hiding brand selection');
      setShowBrandSelection(false);
      console.log('🔵 Brand selection hidden, showing OTB Planning for all brands (prototype)');
      // For prototype, all brands lead to the same OTB Planning screen
    }
  };

  const brands = [
    { id: 'netplay', name: 'Netplay', enabled: true },
    { id: 'teamspirit', name: 'Teamspirit', enabled: true },
    { id: 'dnmx', name: 'DNMX', enabled: true },
    { id: 'yousta', name: 'Yousta', enabled: true },
    { id: 'altheory', name: 'Altheory', enabled: true }
  ];

  // Get display name for selected brand
  const getSelectedBrandName = () => {
    const brand = brands.find(b => b.id === selectedBrand);
    return brand ? brand.name : 'Netplay';
  };

  // Task 12: Discard Changes Handler
  const handleDiscardChanges = () => {
    // Exit review mode without applying changes
    setReviewMode(false);
    setReviewChanges(null);
    
    // Clear any temporary edit state
    setTempInputValue('');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Login Page Component
  if (!isAuthenticated) {
    console.log('🟢 Rendering Login Page - isAuthenticated:', isAuthenticated);
    return (
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side - Marketing Content */}
        <div className="bg-gray-100 flex flex-col items-center justify-center p-12">
          <div className="max-w-md">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">I</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">Impetus</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
              Streamlining Your Costing Operations with Precision and Agility
            </h1>
            
            <div className="mt-12 bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white flex items-center justify-center p-12">
          <div className="w-full max-w-md">
            <h2 className="text-4xl font-bold text-gray-900 mb-12">Login</h2>
            
            <div>
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">
                  Email ID / Mobile Number
                </label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email or mobile"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                />
              </div>

              <div className="mb-6 text-right">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  console.log('🟡 Login button clicked');
                  handleLogin();
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-6"
              >
                Login
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-500">OR</span>
              </div>

              <div className="text-center mt-6">
                <span className="text-sm text-gray-700">
                  Are you a Fynd or Reliance employee?{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Login here
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Brand Selection Page
  if (showBrandSelection) {
    console.log('🟢 Rendering Brand Selection - showBrandSelection:', showBrandSelection);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Brand</h2>

          <div className="space-y-3 mb-6">
            {brands.map((brand) => (
              <label
                key={brand.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  brand.enabled
                    ? 'cursor-pointer hover:bg-gray-50 border-gray-200'
                    : 'cursor-not-allowed bg-gray-50 border-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="brand"
                  value={brand.id}
                  checked={selectedBrand === brand.id}
                  onChange={(e) => brand.enabled && handleBrandSelect(e.target.value)}
                  disabled={!brand.enabled}
                  className="w-5 h-5 text-blue-600 cursor-pointer"
                />
                <span className={`text-lg ${
                  brand.enabled ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {brand.name}
                </span>
                {!brand.enabled && (
                  <span className="ml-auto text-xs text-gray-400">(Disabled)</span>
                )}
              </label>
            ))}
          </div>

          <button
            onClick={handleBrandContinue}
            disabled={!selectedBrand}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              selectedBrand
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            {!sidebarCollapsed && <span className="font-semibold text-lg">Impetus</span>}
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-2 space-y-1">
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer`}
              title={sidebarCollapsed ? "Purchasing" : ""}
            >
              <span className="text-sm">☰</span>
              {!sidebarCollapsed && <span className="text-sm">Purchasing</span>}
              {!sidebarCollapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
            </div>

            <div>
              <div 
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 bg-blue-50 text-blue-600 rounded cursor-pointer`}
                onClick={toggleIntellInr}
                title={sidebarCollapsed ? "Intell INR" : ""}
              >
                <span className="text-sm">☰</span>
                {!sidebarCollapsed && <span className="text-sm font-medium">Intell INR</span>}
                {!sidebarCollapsed && (intellInrExpanded ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />)}
              </div>
              
              {intellInrExpanded && !sidebarCollapsed && (
                <div className="ml-4 mt-1 space-y-1">
                  <div 
                    className={`px-3 py-2 text-sm rounded cursor-pointer ${
                      activeSubmenu === 'Project Config' 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveSubmenu('Project Config')}
                  >
                    Project Config
                  </div>
                  <div 
                    className={`px-3 py-2 text-sm rounded cursor-pointer ${
                      activeSubmenu === 'OTB Planning' 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveSubmenu('OTB Planning')}
                  >
                    OTB Planning
                  </div>
                </div>
              )}
            </div>

            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer`}
              title={sidebarCollapsed ? "Store Utility" : ""}
            >
              <span className="text-sm">⚡</span>
              {!sidebarCollapsed && <span className="text-sm">Store Utility</span>}
            </div>

            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer`}
              title={sidebarCollapsed ? "IntelliStore" : ""}
            >
              <span className="text-sm">📦</span>
              {!sidebarCollapsed && <span className="text-sm">IntelliStore</span>}
            </div>

            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer`}
              title={sidebarCollapsed ? "UVP" : ""}
            >
              <span className="text-sm">☰</span>
              {!sidebarCollapsed && <span className="text-sm">UVP</span>}
              {!sidebarCollapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
            </div>

            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer`}
              title={sidebarCollapsed ? "Planning" : ""}
            >
              <span className="text-sm">☰</span>
              {!sidebarCollapsed && <span className="text-sm">Planning</span>}
              {!sidebarCollapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
            </div>

            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer`}
              title={sidebarCollapsed ? "QC" : ""}
            >
              <span className="text-sm">☰</span>
              {!sidebarCollapsed && <span className="text-sm">QC</span>}
              {!sidebarCollapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
            </div>

            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer`}
              title={sidebarCollapsed ? "Analytics" : ""}
            >
              <span className="text-sm">⏱</span>
              {!sidebarCollapsed && <span className="text-sm">Analytics</span>}
              {!sidebarCollapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
            </div>

            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-gray-400 hover:bg-gray-100 rounded cursor-pointer`}
              title={sidebarCollapsed ? "Settings" : ""}
            >
              <span className="text-sm">⚙</span>
              {!sidebarCollapsed && <span className="text-sm">Settings</span>}
            </div>
          </div>
        </nav>

        <div className="border-t border-gray-200 p-2">
          <div 
            className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer`}
            title={sidebarCollapsed ? "Notification" : ""}
          >
            <span className="text-sm">🔔</span>
            {!sidebarCollapsed && <span className="text-sm">Notification</span>}
          </div>
          <div 
            className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer`}
            title={sidebarCollapsed ? "Ask Impetus" : ""}
          >
            <span className="text-sm">💬</span>
            {!sidebarCollapsed && <span className="text-sm">Ask Impetus</span>}
          </div>
          <div 
            className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-gray-700 hover:bg-gray-100 rounded cursor-pointer`}
            title={sidebarCollapsed ? "Support" : ""}
          >
            <span className="text-sm">❓</span>
            {!sidebarCollapsed && <span className="text-sm">Support</span>}
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 flex items-center justify-between">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
            <div 
              className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm"
              title={sidebarCollapsed ? "Sourav Nayak - Odm-Buyer" : ""}
            >
              SN
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="text-sm font-medium">Sourav Nayak</div>
                <div className="text-xs text-gray-500">Odm-Buyer</div>
              </div>
            )}
          </div>
          {!sidebarCollapsed && <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1">{activeSubmenu}</h1>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Brand:</span>
                <select 
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  className="px-3 py-1 border border-gray-300 rounded text-sm bg-white"
                >
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Role:</span>
                <select 
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="Maker">Maker</option>
                  <option value="Checker">Checker</option>
                  <option value="Approver">Approver</option>
                </select>
                <span className="text-xs text-gray-500">(Prototype only)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Select Project</label>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                <option>azorte_sourav</option>
              </select>
            </div>
          </div>
        </div>

        {activeSubmenu === 'OTB Planning' ? (
          otbView === 'snapshot' ? (
            <div className="p-6">
              <div className="bg-white rounded-lg">
                <div className="border-b border-gray-200 px-6 pt-6">
                  <h2 className="text-xl font-semibold mb-4">OTB Snapshot</h2>
                  <div className="flex gap-1">
                    {['Creation', 'Review', 'Approval', 'Completed', 'Expired'].map((tab) => (
                      <button
                        key={tab}
                        className={`px-6 py-3 text-sm font-medium border-b-2 ${
                          snapshotTab === tab
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setSnapshotTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="py-3 px-6 bg-blue-50 border-t border-blue-100">
                    <p className="text-sm text-gray-700">{getTabDescription(snapshotTab)}</p>
                  </div>
                </div>
                <div className="p-6">
                  {snapshotTab === 'Creation' && (userRole === 'Maker' || userRole === 'Checker') && (
                    <div className="mb-4 flex justify-end">
                      <button 
                        onClick={handleOpenCreateDialog}
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                      >
                        <span>➕</span>
                        Create OTB
                      </button>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">OTB Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hit</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Drop</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created On</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{getDateColumnHeader(snapshotTab)}</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                          {shouldShowActionsColumn(snapshotTab, userRole) && (
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {otbSnapshotData[snapshotTab].length === 0 ? (
                          <tr>
                            <td 
                              colSpan={shouldShowActionsColumn(snapshotTab, userRole) ? 7 : 6} 
                              className="py-20 text-center"
                            >
                              <p className="text-gray-500 text-sm">No data to preview</p>
                            </td>
                          </tr>
                        ) : (
                          otbSnapshotData[snapshotTab].map((row, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm">
                                <button 
                                  onClick={() => handleOTBClick(row[0])}
                                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left cursor-pointer"
                                >
                                  {row[0]}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-700">{row[1]}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">{row[2]}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">{row[3]}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">{row[4]}</td>
                              <td className="py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(row[5]).color}`}>
                                  {row[5]}
                                </span>
                              </td>
                              {shouldShowActionsColumn(snapshotTab, userRole) && (
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-center gap-2">
                                    {getSnapshotActions(snapshotTab, row[5], userRole).map((action, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleSnapshotAction(action.action, row[0])}
                                        title={action.label}
                                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                                      >
                                        {getActionIcon(action.action)}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
          <div className="p-6">
            <div className="bg-white rounded-lg p-4 mb-6 flex items-center gap-4">
              <button 
                onClick={handleBackToSnapshot}
                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              
              <div className="flex-1 relative" ref={dropdownRef}>
                <div 
                  className="flex items-center justify-between gap-2 border border-gray-300 rounded px-3 py-2 cursor-pointer"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <input 
                    type="text" 
                    placeholder={selectedOTB || "Search OTB"}
                    value={selectedOTB}
                    readOnly
                    className="flex-1 outline-none text-sm cursor-pointer"
                  />
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    {otbList.map((otb, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectOTB(otb)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">📄</span>
                            <span className="text-sm">{otb.id}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusConfig(otb.status).color}`}>
                            {getStatusConfig(otb.status).label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">By {otb.createdBy}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Info Mode</span>
                <label className="relative inline-block w-11 h-6">
                  <input type="checkbox" className="opacity-0 w-0 h-0 peer" />
                  <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-blue-600">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></span>
                  </span>
                </label>
              </div>

              {selectedOTB && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download As CSV
                </button>
              )}
            </div>

            {selectedOTB && (
              <div className="bg-white rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8 flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'border-2 border-gray-300 text-gray-400'}`}>
                        {currentStep > 1 ? '✓' : '1'}
                      </div>
                      <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Creation</span>
                    </div>
                    <div className={`flex-1 h-0.5 ${currentStep > 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'border-2 border-gray-300 text-gray-400'}`}>
                        {currentStep > 2 ? '✓' : '2'}
                      </div>
                      <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Review</span>
                    </div>
                    <div className={`flex-1 h-0.5 ${currentStep > 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'border-2 border-gray-300 text-gray-400'}`}>
                        {currentStep > 3 ? '✓' : '3'}
                      </div>
                      <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Approval</span>
                    </div>
                    <div className={`flex-1 h-0.5 ${currentStep > 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-green-600 text-white' : 'border-2 border-gray-300 text-gray-400'}`}>
                        {currentStep >= 4 ? '✓' : '4'}
                      </div>
                      <span className={`text-sm font-medium ${currentStep >= 4 ? 'text-gray-900' : 'text-gray-400'}`}>Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg">
              <div className="border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Weekly/Monthly Tabs */}
                  <div className="flex">
                    <button 
                      className={`px-6 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'Weekly' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => setActiveTab('Weekly')}
                    >
                      Weekly
                    </button>
                    <button 
                      className={`px-6 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'Monthly' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => setActiveTab('Monthly')}
                    >
                      Monthly
                    </button>
                  </div>
                  
                  {/* Save/Undo/Redo Buttons - Only for Makers with editable OTBs */}
                  {selectedOTB && userRole === 'Maker' && 
                   (otbStatus === 'in_progress' || otbStatus === 'change_requested') && (
                    <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300">
                      <button
                        onClick={handleSaveOTB}
                        disabled={!hasUnsavedChanges}
                        title="Save"
                        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                          !hasUnsavedChanges ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        <span className="text-lg">💾</span>
                      </button>
                      <button
                        onClick={handleUndo}
                        title="Undo (Coming Soon)"
                        className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <span className="text-lg">↩️</span>
                      </button>
                      <button
                        onClick={handleRedo}
                        title="Redo (Coming Soon)"
                        className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <span className="text-lg">↪️</span>
                      </button>
                      
                      {/* Comment Icon Button */}
                      <button
                        onClick={() => {
                          if (getCurrentComments().length > 0) {
                            setSidePaneState({
                              visible: true,
                              highlightedCommentId: null,
                              filterUserId: null
                            });
                          }
                        }}
                        disabled={getCurrentComments().length === 0}
                        title={getCurrentComments().length > 0 ? "View Remarks" : "No remarks yet"}
                        className={`p-2 rounded transition-colors relative ${
                          getCurrentComments().length === 0 
                            ? 'opacity-40 cursor-not-allowed' 
                            : 'hover:bg-blue-50 cursor-pointer'
                        }`}
                      >
                        <span className={`text-lg ${getCurrentComments().length > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                          💬
                        </span>
                        {getCurrentComments().length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                            {getCurrentComments().length}
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <div className="pr-4 flex items-center gap-3">
                  {selectedOTB && getActionButtons(otbStatus, userRole).map((button, index) => (
                    <button
                      key={index}
                      title={button.tooltip}
                      onClick={() => handleActionClick(button.action)}
                      className="w-8 h-8 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center transition-colors"
                    >
                      {button.icon}
                    </button>
                  ))}
                  {selectedOTB && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusConfig(otbStatus).color}`}>
                      {getStatusConfig(otbStatus).label}
                    </span>
                  )}
                </div>
              </div>

              {!selectedOTB ? (
                <div className="p-20 text-center">
                  <p className="text-gray-500 text-sm">
                    No data found. Please load a saved OTB or create a new OTB.
                  </p>
                </div>
              ) : (
                <div className={`p-4 ${reviewMode ? 'pb-24' : ''}`}>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {['Brand', 'Sub-Format', 'Fashion Grade', 'Segment', 'Family', 'Sales Channel'].map((filter) => (
                      <button key={filter} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-1">
                        {filter}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th rowSpan="3" className="p-2 text-left bg-gray-50 sticky left-0 z-10 border-r font-semibold min-w-[200px]">KPI</th>
                          <th colSpan="10" className="p-2 text-center bg-blue-50 border-b border-r">
                            <div className="font-semibold">Actual</div>
                          </th>
                          <th colSpan="3" className="p-2 text-center bg-orange-50 border-b">
                            <div className="font-semibold">Projected</div>
                          </th>
                        </tr>
                        <tr className="border-b">
                          <th colSpan="4" className="p-2 text-center bg-blue-50 border-r">
                            <div className="text-gray-600">Jul-2025</div>
                          </th>
                          <th colSpan="4" className="p-2 text-center bg-green-50 border-r">
                            <div className="text-gray-600">Aug-2025</div>
                          </th>
                          <th colSpan="2" className="p-2 text-center bg-purple-50 border-r">
                            <div className="text-gray-600">Sep-2025</div>
                          </th>
                          <th colSpan="3" className="p-2 text-center bg-orange-50">
                            <div className="text-gray-600">Sep-2025</div>
                          </th>
                        </tr>
                        <tr className="border-b bg-gray-50">
                          <th className="p-2 text-center font-medium border-r">W19</th>
                          <th className="p-2 text-center font-medium border-r">W20</th>
                          <th className="p-2 text-center font-medium border-r">W21</th>
                          <th className="p-2 text-center font-medium border-r">W22</th>
                          <th className="p-2 text-center font-medium border-r">W23</th>
                          <th className="p-2 text-center font-medium border-r">W24</th>
                          <th className="p-2 text-center font-medium border-r">W25</th>
                          <th className="p-2 text-center font-medium border-r">W26</th>
                          <th className="p-2 text-center font-medium border-r">W27</th>
                          <th className="p-2 text-center font-medium border-r">W28</th>
                          <th className="p-2 text-center font-medium border-r">W29</th>
                          <th className="p-2 text-center font-medium border-r">W30</th>
                          <th className="p-2 text-center font-medium">W31</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-blue-50">
                          <td colSpan="14" className="p-2 font-semibold text-blue-700">Net Sales</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">AOP Net Sales (INR)</td>
                          {[1910346, 1914576, 2043876, 2010151, 1958544, 1988075, 1926119, 1866663, 1423494, 1354700, 1491407, 1454577, 1368922].map((value, idx) => {
                            const cellId = generateCellId('netSalesAOP', idx, idx >= 10);
                            const cellLabel = generateCellLabel('netSalesAOP', idx, idx >= 10);
                            return (
                              <td 
                                key={idx} 
                                className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`}
                                data-cell-id={cellId}
                                onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}
                              >
                                {value.toLocaleString()}
                                {cellHasComments(cellId) && (
                                  <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">CY Net Sales (INR)</td>
                          {[2307036, 2140249, 2169656, 2245244, 2243000, 2207987, 2184799, 324193, 0, 0, 1491407, 1454577, 1368922].map((value, idx) => {
                            const cellId = generateCellId('netSalesCY', idx, idx >= 10);
                            const cellLabel = generateCellLabel('netSalesCY', idx, idx >= 10);
                            return (
                              <td 
                                key={idx} 
                                className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`}
                                data-cell-id={cellId}
                                onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}
                              >
                                {value.toLocaleString()}
                                {cellHasComments(cellId) && (
                                  <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">LY Net Sales (INR)</td>
                          {[2670127, 2594354, 2817312, 2682451, 2756552, 2762970, 2797071, 2681219, 2723994, 2754145, 2828723, 2781883, 2753462].map((value, idx) => {
                            const cellId = generateCellId('netSalesLY', idx, idx >= 10);
                            const cellLabel = generateCellLabel('netSalesLY', idx, idx >= 10);
                            return (
                              <td 
                                key={idx} 
                                className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`}
                                data-cell-id={cellId}
                                onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}
                              >
                                {value.toLocaleString()}
                                {cellHasComments(cellId) && (
                                  <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">Achievement Against AOP</td>
                          {['121%', '112%', '106%', '112%', '115%', '111%', '113%', '17%', '0%', '0%', '100%', '100%', '100%'].map((value, idx) => {
                            const cellId = generateCellId('achievementAOP', idx, idx >= 10);
                            const cellLabel = generateCellLabel('achievementAOP', idx, idx >= 10);
                            return (
                              <td 
                                key={idx} 
                                className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`}
                                data-cell-id={cellId}
                                onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}
                              >
                                {value}
                                {cellHasComments(cellId) && (
                                  <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">Change Over LY</td>
                          {['-14%', '-18%', '-23%', '-16%', '-19%', '-20%', '-22%', '-88%', '-100%', '-100%', '-47%', '-48%', '-50%'].map((value, idx) => {
                            const cellId = generateCellId('changeLY', idx, idx >= 10);
                            const cellLabel = generateCellLabel('changeLY', idx, idx >= 10);
                            return (
                              <td 
                                key={idx} 
                                className={`p-2 text-right border-r text-red-600 relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`}
                                data-cell-id={cellId}
                                onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}
                              >
                                {value}
                                {cellHasComments(cellId) && (
                                  <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>

                        <tr className="bg-blue-50">
                          <td colSpan="14" className="p-2 font-semibold text-blue-700">MRP</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">AOP MRP (INR)</td>
                          {[1357, 1422, 1371, 1384, 1307, 1290, 1311, 1315, 1219, 1241, 1212, 1209, 1226].map((value, idx) => {
                            const cellId = generateCellId('mrpAOP', idx, idx >= 10);
                            const cellLabel = generateCellLabel('mrpAOP', idx, idx >= 10);
                            return (
                              <td key={idx} className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`} data-cell-id={cellId} onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}>
                                {value.toLocaleString()}
                                {cellHasComments(cellId) && <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">CY MRP (INR)</td>
                          {[664, 660, 661, 667, 660, 661, 666, 681, 0, 0, 1212, 1209, 1226].map((value, idx) => {
                            const cellId = generateCellId('mrpCY', idx, idx >= 10);
                            const cellLabel = generateCellLabel('mrpCY', idx, idx >= 10);
                            return (
                              <td key={idx} className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`} data-cell-id={cellId} onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}>
                                {value.toLocaleString()}
                                {cellHasComments(cellId) && <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">LY MRP (INR)</td>
                          {[661, 661, 660, 655, 664, 660, 661, 658, 659, 665, 657, 655, 662].map((value, idx) => {
                            const cellId = generateCellId('mrpLY', idx, idx >= 10);
                            const cellLabel = generateCellLabel('mrpLY', idx, idx >= 10);
                            return (
                              <td key={idx} className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`} data-cell-id={cellId} onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}>
                                {value.toLocaleString()}
                                {cellHasComments(cellId) && <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>}
                              </td>
                            );
                          })}
                        </tr>

                        <tr className="bg-blue-50">
                          <td colSpan="14" className="p-2 font-semibold text-blue-700">Discount</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">AOP Discount</td>
                          {['40%', '39%', '40%', '40%', '37%', '39%', '38%', '37%', '41%', '41%', '41%', '40%', '42%'].map((value, idx) => {
                            const cellId = generateCellId('discountAOP', idx, idx >= 10);
                            const cellLabel = generateCellLabel('discountAOP', idx, idx >= 10);
                            return (
                              <td key={idx} className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`} data-cell-id={cellId} onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}>
                                {value}
                                {cellHasComments(cellId) && <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">CY Discount</td>
                          {['30%', '31%', '31%', '31%', '31%', '30%', '31%', '32%', '0%', '0%', '41%', '40%', '42%'].map((value, idx) => {
                            const cellId = generateCellId('discountCY', idx, idx >= 10);
                            const cellLabel = generateCellLabel('discountCY', idx, idx >= 10);
                            return (
                              <td key={idx} className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`} data-cell-id={cellId} onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}>
                                {value}
                                {cellHasComments(cellId) && <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">LY Discount</td>
                          {['31%', '31%', '31%', '31%', '31%', '31%', '31%', '31%', '31%', '31%', '31%', '31%', '31%'].map((value, idx) => {
                            const cellId = generateCellId('discountLY', idx, idx >= 10);
                            const cellLabel = generateCellLabel('discountLY', idx, idx >= 10);
                            return (
                              <td key={idx} className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`} data-cell-id={cellId} onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}>
                                {value}
                                {cellHasComments(cellId) && <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>}
                              </td>
                            );
                          })}
                        </tr>

                        <tr className="bg-blue-50">
                          <td colSpan="14" className="p-2 font-semibold text-blue-700">Average Selling Price</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">AOP ASP (INR)</td>
                          {[810.12, 866.37, 820.45, 833.77, 817.90, 791.21, 810.85, 823.69, 719.96, 734.84, 712.40, 721.81, 716.55].map((value, idx) => {
                            const cellId = generateCellId('aspAOP', idx, idx >= 10);
                            const cellLabel = generateCellLabel('aspAOP', idx, idx >= 10);
                            return (
                              <td key={idx} className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`} data-cell-id={cellId} onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}>
                                {value.toFixed(2)}
                                {cellHasComments(cellId) && <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">CY ASP (INR)</td>
                          {[463.91, 457.71, 457.44, 458.68, 453.59, 460.48, 462.00, 465.13, 0, 0, 712.40, 721.81, 716.55].map((value, idx) => {
                            const cellId = generateCellId('aspCY', idx, idx >= 10);
                            const cellLabel = generateCellLabel('aspCY', idx, idx >= 10);
                            return (
                              <td key={idx} className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`} data-cell-id={cellId} onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}>
                                {value.toFixed(2)}
                                {cellHasComments(cellId) && <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">LY ASP (INR)</td>
                          {[455.65, 456.75, 453.75, 451.06, 456.91, 457.98, 452.82, 451.38, 454.15, 458.26, 451.94, 450.36, 459.60].map((value, idx) => {
                            const cellId = generateCellId('aspLY', idx, idx >= 10);
                            const cellLabel = generateCellLabel('aspLY', idx, idx >= 10);
                            return (
                              <td key={idx} className={`p-2 text-right border-r relative ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`} data-cell-id={cellId} onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}>
                                {value.toFixed(2)}
                                {cellHasComments(cellId) && <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>💬</span>}
                              </td>
                            );
                          })}
                        </tr>

                        <tr className="bg-blue-50">
                          <td colSpan="14" className="p-2 font-semibold text-blue-700">Unit Sales</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">AOP Unit Sales (Qty)</td>
                          <td className="p-2 text-right border-r">2,358</td>
                          <td className="p-2 text-right border-r">2,210</td>
                          <td className="p-2 text-right border-r">2,491</td>
                          <td className="p-2 text-right border-r">2,411</td>
                          <td className="p-2 text-right border-r">2,395</td>
                          <td className="p-2 text-right border-r">2,513</td>
                          <td className="p-2 text-right border-r">2,375</td>
                          <td className="p-2 text-right border-r">2,266</td>
                          <td className="p-2 text-right border-r">1,977</td>
                          <td className="p-2 text-right border-r">1,844</td>
                          <td className="p-2 text-right border-r">2,094</td>
                          <td className="p-2 text-right border-r">2,015</td>
                          <td className="p-2 text-right">1,910</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">CY Unit Sales (Qty)</td>
                          <td className="p-2 text-right border-r">4,973</td>
                          <td className="p-2 text-right border-r">4,676</td>
                          <td className="p-2 text-right border-r">4,743</td>
                          <td className="p-2 text-right border-r">4,895</td>
                          <td className="p-2 text-right border-r">4,945</td>
                          <td className="p-2 text-right border-r">4,795</td>
                          <td className="p-2 text-right border-r">4,729</td>
                          <td className="p-2 text-right border-r">697</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">2,094</td>
                          <td className="p-2 text-right border-r">2,015</td>
                          <td className="p-2 text-right">1,910</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">LY Unit Sales (Qty)</td>
                          <td className="p-2 text-right border-r">5,860</td>
                          <td className="p-2 text-right border-r">5,680</td>
                          <td className="p-2 text-right border-r">6,209</td>
                          <td className="p-2 text-right border-r">5,947</td>
                          <td className="p-2 text-right border-r">6,033</td>
                          <td className="p-2 text-right border-r">6,033</td>
                          <td className="p-2 text-right border-r">6,177</td>
                          <td className="p-2 text-right border-r">5,940</td>
                          <td className="p-2 text-right border-r">5,998</td>
                          <td className="p-2 text-right border-r">6,010</td>
                          <td className="p-2 text-right border-r">6,259</td>
                          <td className="p-2 text-right border-r">6,177</td>
                          <td className="p-2 text-right">5,991</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">Achievement Against AOP</td>
                          <td className="p-2 text-right border-r">210.89%</td>
                          <td className="p-2 text-right border-r">211.60%</td>
                          <td className="p-2 text-right border-r">190.39%</td>
                          <td className="p-2 text-right border-r">203.03%</td>
                          <td className="p-2 text-right border-r">206.51%</td>
                          <td className="p-2 text-right border-r">190.83%</td>
                          <td className="p-2 text-right border-r">199.08%</td>
                          <td className="p-2 text-right border-r">30.76%</td>
                          <td className="p-2 text-right border-r">0.00%</td>
                          <td className="p-2 text-right border-r">0.00%</td>
                          <td className="p-2 text-right border-r">100.00%</td>
                          <td className="p-2 text-right border-r">100.00%</td>
                          <td className="p-2 text-right">100.00%</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">Change Over LY</td>
                          <td className="p-2 text-right border-r text-red-600">-15.14%</td>
                          <td className="p-2 text-right border-r text-red-600">-17.68%</td>
                          <td className="p-2 text-right border-r text-red-600">-23.61%</td>
                          <td className="p-2 text-right border-r text-red-600">-17.69%</td>
                          <td className="p-2 text-right border-r text-red-600">-18.03%</td>
                          <td className="p-2 text-right border-r text-red-600">-20.52%</td>
                          <td className="p-2 text-right border-r text-red-600">-23.44%</td>
                          <td className="p-2 text-right border-r text-red-600">-88.27%</td>
                          <td className="p-2 text-right border-r text-red-600">-100.00%</td>
                          <td className="p-2 text-right border-r text-red-600">-100.00%</td>
                          <td className="p-2 text-right border-r text-red-600">-66.55%</td>
                          <td className="p-2 text-right border-r text-red-600">-67.38%</td>
                          <td className="p-2 text-right text-red-600">-68.11%</td>
                        </tr>

                        <tr className="bg-blue-50">
                          <td colSpan="14" className="p-2 font-semibold text-blue-700">Inventory</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">Target Inventory (Qty)</td>
                          <td className="p-2 text-right border-r">34,453</td>
                          <td className="p-2 text-right border-r">29,480</td>
                          <td className="p-2 text-right border-r">24,804</td>
                          <td className="p-2 text-right border-r">22,154</td>
                          <td className="p-2 text-right border-r">19,275</td>
                          <td className="p-2 text-right border-r">16,240</td>
                          <td className="p-2 text-right border-r">11,445</td>
                          <td className="p-2 text-right border-r">6,716</td>
                          <td className="p-2 text-right border-r">6,019</td>
                          <td className="p-2 text-right border-r">6,019</td>
                          
                          {/* Projected columns with Review Mode */}
                          {targetInventoryProjected.map((value, projectedIdx) => {
                            const isInReview = reviewMode && 
                                               reviewChanges?.columnIndex === projectedIdx &&
                                               reviewChanges?.changes?.targetInventory !== undefined;
                            
                            return (
                              <td 
                                key={projectedIdx + 10} 
                                className={`p-2 text-right ${projectedIdx < 2 ? 'border-r' : ''} ${
                                  isInReview ? 'bg-yellow-50 border border-yellow-300' : ''
                                }`}
                              >
                                {isInReview && reviewChanges.changes.targetInventory ? (
                                  <div className="flex flex-col items-end space-y-0.5">
                                    <span className="text-gray-400 line-through text-xs">
                                      {reviewChanges.changes.targetInventory.old.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-blue-600 font-semibold">
                                      {reviewChanges.changes.targetInventory.new.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                ) : (
                                  value.toLocaleString('en-IN')
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">Opening Stock (Qty)</td>
                          <td className="p-2 text-right border-r">1,47,903</td>
                          <td className="p-2 text-right border-r">1,47,903</td>
                          <td className="p-2 text-right border-r">1,47,903</td>
                          <td className="p-2 text-right border-r">1,47,903</td>
                          <td className="p-2 text-right border-r">1,47,903</td>
                          <td className="p-2 text-right border-r">1,47,903</td>
                          <td className="p-2 text-right border-r">1,47,903</td>
                          <td className="p-2 text-right border-r">1,47,903</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">4,938</td>
                          <td className="p-2 text-right">10,208</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">Planned Inwards (Qty)</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">7,032</td>
                          <td className="p-2 text-right border-r">7,285</td>
                          <td className="p-2 text-right">4,085</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">Additional Inwards (Qty)</td>
                          
                          {/* Actual columns - Read-only */}
                          {additionalInwardsActual.map((value, idx) => {
                            const cellId = generateCellId('additionalInwards', idx, false);
                            const cellLabel = generateCellLabel('additionalInwards', idx, false);
                            return (
                              <td 
                                key={idx} 
                                className="p-2 text-right border-r relative"
                                data-cell-id={cellId}
                                onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}
                              >
                                {value.toLocaleString()}
                                {cellHasComments(cellId) && (
                                  <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>
                                    💬
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          
                          {/* Step 3: Projected columns - Editable with Review Mode */}
                          {additionalInwardsProjected.map((value, projectedIdx) => {
                            const tableColIndex = projectedIdx + 10;
                            const cellId = generateCellId('additionalInwards', tableColIndex, true);
                            const cellLabel = generateCellLabel('additionalInwards', tableColIndex, true);
                            const isEditing = editingCell?.row === 'additionalInwards' && 
                                              editingCell?.colIndex === projectedIdx;
                            const isInReview = reviewMode && 
                                               reviewChanges?.columnIndex === projectedIdx &&
                                               reviewChanges?.changes?.additionalInwards !== undefined;
                            
                            return (
                              <td 
                                key={tableColIndex} 
                                className={`p-2 text-right ${projectedIdx < 2 ? 'border-r' : ''} relative ${
                                  isInReview 
                                    ? 'bg-yellow-50 border border-yellow-300' 
                                    : 'cursor-pointer hover:bg-blue-50'
                                } ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`}
                                data-cell-id={cellId}
                                onClick={() => !isInReview && !reviewMode && handleCellClick('additionalInwards', tableColIndex)}
                                onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}
                              >
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={tempInputValue}
                                    onChange={(e) => setTempInputValue(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, 'additionalInwards', projectedIdx)}
                                    onBlur={() => handleCellBlur('additionalInwards', projectedIdx)}
                                    autoFocus
                                    className="w-full text-right bg-transparent border-none outline-none"
                                  />
                                ) : isInReview && reviewChanges.changes.additionalInwards ? (
                                  <div className="flex flex-col items-end space-y-0.5">
                                    <span className="text-gray-400 line-through text-xs">
                                      {reviewChanges.changes.additionalInwards.old.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-blue-600 font-semibold">
                                      {reviewChanges.changes.additionalInwards.new.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-blue-700 font-medium">
                                    {value.toLocaleString()}
                                  </span>
                                )}
                                {cellHasComments(cellId) && !isEditing && (
                                  <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>
                                    💬
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>

                        <tr className="bg-blue-50">
                          <td colSpan="14" className="p-2 font-semibold text-blue-700">Week of Cover</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">Actual Cover (in weeks)</td>
                          <td className="p-2 text-right border-r">29.74</td>
                          <td className="p-2 text-right border-r">31.63</td>
                          <td className="p-2 text-right border-r">31.18</td>
                          <td className="p-2 text-right border-r">30.22</td>
                          <td className="p-2 text-right border-r">29.91</td>
                          <td className="p-2 text-right border-r">30.85</td>
                          <td className="p-2 text-right border-r">31.28</td>
                          <td className="p-2 text-right border-r">212.20</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">2.45</td>
                          <td className="p-2 text-right">5.34</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">Target Cover (in weeks)</td>
                          
                          {/* Actual columns - Read-only */}
                          {targetCoverActual.map((value, idx) => {
                            const cellId = generateCellId('targetCover', idx, false);
                            const cellLabel = generateCellLabel('targetCover', idx, false);
                            return (
                              <td 
                                key={idx} 
                                className="p-2 text-right border-r relative"
                                data-cell-id={cellId}
                                onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}
                              >
                                {value}
                                {cellHasComments(cellId) && (
                                  <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>
                                    💬
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          
                          {/* Projected columns - Editable with Review Mode */}
                          {targetCoverProjected.map((value, projectedIdx) => {
                            const tableColIndex = projectedIdx + 10;
                            const cellId = generateCellId('targetCover', tableColIndex, true);
                            const cellLabel = generateCellLabel('targetCover', tableColIndex, true);
                            const isEditing = editingCell?.row === 'targetCover' && 
                                              editingCell?.colIndex === projectedIdx;
                            const isInReview = reviewMode && 
                                               reviewChanges?.columnIndex === projectedIdx &&
                                               reviewChanges?.changes?.targetCover !== undefined;
                            
                            return (
                              <td 
                                key={tableColIndex} 
                                className={`p-2 text-right ${projectedIdx < 2 ? 'border-r' : ''} relative ${
                                  isInReview 
                                    ? 'bg-yellow-50 border border-yellow-300' 
                                    : 'cursor-pointer hover:bg-blue-50'
                                } ${highlightedCellId === cellId ? 'bg-yellow-200' : ''}`}
                                data-cell-id={cellId}
                                onClick={() => !isInReview && !reviewMode && handleCellClick('targetCover', tableColIndex)}
                                onContextMenu={(e) => handleCellRightClick(e, cellId, cellLabel)}
                              >
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={tempInputValue}
                                    onChange={(e) => setTempInputValue(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, 'targetCover', projectedIdx)}
                                    onBlur={() => handleCellBlur('targetCover', projectedIdx)}
                                    autoFocus
                                    className="w-full text-right bg-transparent border-none outline-none"
                                  />
                                ) : isInReview && reviewChanges?.changes?.targetCover ? (
                                  <div className="flex flex-col items-end space-y-0.5">
                                    <span className="text-gray-400 line-through text-xs">
                                      {reviewChanges.changes.targetCover.old}
                                    </span>
                                    <span className="text-blue-600 font-semibold">
                                      {reviewChanges.changes.targetCover.new}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-blue-700 font-medium">
                                    {value}
                                  </span>
                                )}
                                {cellHasComments(cellId) && !isEditing && (
                                  <span className="absolute top-1 left-1 text-blue-500 text-xs" title={`${getCellComments(cellId).length} remark(s)`}>
                                    💬
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">LY Cover (in weeks)</td>
                          <td className="p-2 text-right border-r">143.04</td>
                          <td className="p-2 text-right border-r">147.57</td>
                          <td className="p-2 text-right border-r">135.00</td>
                          <td className="p-2 text-right border-r">140.95</td>
                          <td className="p-2 text-right border-r">138.94</td>
                          <td className="p-2 text-right border-r">138.94</td>
                          <td className="p-2 text-right border-r">135.70</td>
                          <td className="p-2 text-right border-r">141.11</td>
                          <td className="p-2 text-right border-r">139.75</td>
                          <td className="p-2 text-right border-r">139.47</td>
                          <td className="p-2 text-right border-r">133.92</td>
                          <td className="p-2 text-right border-r">135.70</td>
                          <td className="p-2 text-right">139.91</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">Cover Variance (in weeks)</td>
                          <td className="p-2 text-right border-r text-red-600">-21.74</td>
                          <td className="p-2 text-right border-r text-red-600">-23.63</td>
                          <td className="p-2 text-right border-r text-red-600">-23.18</td>
                          <td className="p-2 text-right border-r text-red-600">-22.22</td>
                          <td className="p-2 text-right border-r text-red-600">-21.91</td>
                          <td className="p-2 text-right border-r text-red-600">-22.85</td>
                          <td className="p-2 text-right border-r text-red-600">-23.28</td>
                          <td className="p-2 text-right border-r text-red-600">-204.20</td>
                          <td className="p-2 text-right border-r">8</td>
                          <td className="p-2 text-right border-r">8</td>
                          <td className="p-2 text-right border-r">8</td>
                          <td className="p-2 text-right border-r">5.55</td>
                          <td className="p-2 text-right">2.66</td>
                        </tr>

                        <tr className="bg-blue-50">
                          <td colSpan="14" className="p-2 font-semibold text-blue-700">Intake Margin</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">AOP Margin</td>
                          <td className="p-2 text-right border-r">36.00%</td>
                          <td className="p-2 text-right border-r">35.46%</td>
                          <td className="p-2 text-right border-r">36.12%</td>
                          <td className="p-2 text-right border-r">35.35%</td>
                          <td className="p-2 text-right border-r">39.67%</td>
                          <td className="p-2 text-right border-r">37.89%</td>
                          <td className="p-2 text-right border-r">38.78%</td>
                          <td className="p-2 text-right border-r">39.43%</td>
                          <td className="p-2 text-right border-r">37.14%</td>
                          <td className="p-2 text-right border-r">37.08%</td>
                          <td className="p-2 text-right border-r">37.62%</td>
                          <td className="p-2 text-right border-r">37.26%</td>
                          <td className="p-2 text-right">37.79%</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">CY Margin</td>
                          <td className="p-2 text-right border-r">54.58%</td>
                          <td className="p-2 text-right border-r">54.77%</td>
                          <td className="p-2 text-right border-r">54.48%</td>
                          <td className="p-2 text-right border-r">55.40%</td>
                          <td className="p-2 text-right border-r">55.33%</td>
                          <td className="p-2 text-right border-r">54.96%</td>
                          <td className="p-2 text-right border-r">54.88%</td>
                          <td className="p-2 text-right border-r">55.81%</td>
                          <td className="p-2 text-right border-r">0.00%</td>
                          <td className="p-2 text-right border-r">0.00%</td>
                          <td className="p-2 text-right border-r">37.62%</td>
                          <td className="p-2 text-right border-r">37.26%</td>
                          <td className="p-2 text-right">37.79%</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">LY Margin</td>
                          <td className="p-2 text-right border-r">55.20%</td>
                          <td className="p-2 text-right border-r">55.00%</td>
                          <td className="p-2 text-right border-r">55.41%</td>
                          <td className="p-2 text-right border-r">55.13%</td>
                          <td className="p-2 text-right border-r">54.98%</td>
                          <td className="p-2 text-right border-r">54.88%</td>
                          <td className="p-2 text-right border-r">55.48%</td>
                          <td className="p-2 text-right border-r">54.64%</td>
                          <td className="p-2 text-right border-r">55.29%</td>
                          <td className="p-2 text-right border-r">55.22%</td>
                          <td className="p-2 text-right border-r">55.29%</td>
                          <td className="p-2 text-right border-r">55.36%</td>
                          <td className="p-2 text-right">55.09%</td>
                        </tr>

                        <tr className="bg-blue-50">
                          <td colSpan="14" className="p-2 font-semibold text-blue-700">COGS</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">AOP COGS (INR)</td>
                          <td className="p-2 text-right border-r">868.60</td>
                          <td className="p-2 text-right border-r">917.55</td>
                          <td className="p-2 text-right border-r">875.56</td>
                          <td className="p-2 text-right border-r">894.73</td>
                          <td className="p-2 text-right border-r">788.42</td>
                          <td className="p-2 text-right border-r">800.91</td>
                          <td className="p-2 text-right border-r">802.56</td>
                          <td className="p-2 text-right border-r">796.35</td>
                          <td className="p-2 text-right border-r">766.50</td>
                          <td className="p-2 text-right border-r">780.85</td>
                          <td className="p-2 text-right border-r">756.07</td>
                          <td className="p-2 text-right border-r">758.70</td>
                          <td className="p-2 text-right">762.49</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">CY COGS (INR)</td>
                          <td className="p-2 text-right border-r">301.52</td>
                          <td className="p-2 text-right border-r">298.72</td>
                          <td className="p-2 text-right border-r">300.75</td>
                          <td className="p-2 text-right border-r">297.39</td>
                          <td className="p-2 text-right border-r">294.67</td>
                          <td className="p-2 text-right border-r">297.89</td>
                          <td className="p-2 text-right border-r">300.41</td>
                          <td className="p-2 text-right border-r">300.74</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">0</td>
                          <td className="p-2 text-right border-r">756.07</td>
                          <td className="p-2 text-right border-r">758.70</td>
                          <td className="p-2 text-right">762.49</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">LY COGS (INR)</td>
                          <td className="p-2 text-right border-r">295.93</td>
                          <td className="p-2 text-right border-r">297.34</td>
                          <td className="p-2 text-right border-r">294.39</td>
                          <td className="p-2 text-right border-r">293.70</td>
                          <td className="p-2 text-right border-r">298.86</td>
                          <td className="p-2 text-right border-r">297.66</td>
                          <td className="p-2 text-right border-r">294.10</td>
                          <td className="p-2 text-right border-r">298.61</td>
                          <td className="p-2 text-right border-r">294.80</td>
                          <td className="p-2 text-right border-r">297.81</td>
                          <td className="p-2 text-right border-r">293.51</td>
                          <td className="p-2 text-right border-r">292.26</td>
                          <td className="p-2 text-right">297.38</td>
                        </tr>

                        <tr className="bg-blue-50">
                          <td colSpan="14" className="p-2 font-semibold text-blue-700">OTB</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">OTB Units (Qty)</td>
                          
                          {/* Actual columns - Read-only */}
                          {otbUnitsActual.map((value, idx) => (
                            <td key={idx} className="p-2 text-right border-r text-red-600">
                              {value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          ))}
                          
                          {/* Projected columns - From state with Review Mode */}
                          {otbUnitsProjected.map((value, projectedIdx) => {
                            const isNegative = value < 0;
                            const isInReview = reviewMode && 
                                               reviewChanges?.columnIndex === projectedIdx &&
                                               reviewChanges?.changes?.otbUnits !== undefined;
                            
                            return (
                              <td 
                                key={projectedIdx + 10} 
                                className={`p-2 text-right ${projectedIdx < 2 ? 'border-r' : ''} ${
                                  isInReview ? 'bg-yellow-50 border border-yellow-300' : isNegative ? 'text-red-600' : ''
                                }`}
                              >
                                {isInReview && reviewChanges.changes.otbUnits ? (
                                  <div className="flex flex-col items-end space-y-0.5">
                                    <span className="text-gray-400 line-through text-xs">
                                      {reviewChanges.changes.otbUnits.old.toLocaleString('en-IN')}
                                    </span>
                                    <span className={`font-semibold ${reviewChanges.changes.otbUnits.new < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                      {reviewChanges.changes.otbUnits.new.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                ) : (
                                  value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium sticky left-0 bg-white">OTB COGS (INR)</td>
                          
                          {/* Actual columns - Read-only */}
                          {otbCogsActual.map((value, idx) => (
                            <td key={idx} className="p-2 text-right border-r text-red-600">
                              {value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          ))}
                          
                          {/* Projected columns - From state with Review Mode */}
                          {otbCogsProjected.map((value, projectedIdx) => {
                            const isNegative = value < 0;
                            const isInReview = reviewMode && 
                                               reviewChanges?.columnIndex === projectedIdx &&
                                               reviewChanges?.changes?.otbCogs !== undefined;
                            
                            return (
                              <td 
                                key={projectedIdx + 10} 
                                className={`p-2 text-right ${projectedIdx < 2 ? 'border-r' : ''} ${
                                  isInReview ? 'bg-yellow-50 border border-yellow-300' : isNegative ? 'text-red-600' : ''
                                }`}
                              >
                                {isInReview && reviewChanges.changes.otbCogs ? (
                                  <div className="flex flex-col items-end space-y-0.5">
                                    <span className="text-gray-400 line-through text-xs">
                                      {reviewChanges.changes.otbCogs.old.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className={`font-semibold ${reviewChanges.changes.otbCogs.new < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                      {reviewChanges.changes.otbCogs.new.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                ) : (
                                  value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
          )
        ) : (
          <div className="p-6 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="font-semibold">Brand Config</h2>
                <span className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full">Upload failed</span>
              </div>
              <div className="p-4">
                <div className="border-l-4 border-red-400 bg-red-50 p-4 rounded">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-red-600 text-sm">📎</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">brand 2 empty values.csv</div>
                      <div className="text-xs text-gray-600 mt-1">Uploaded on 31 Oct 2025, 02:24 pm by Chinta Anusha</div>
                    </div>
                    <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded text-sm hover:bg-blue-50 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </div>
                  <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
                    <span className="text-red-800 text-sm">⚠️ File Upload Failed. Download Last Error File to check</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Last Success File
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm text-red-600 hover:bg-red-50 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Last Error File
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Last Run Config Data
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="font-semibold">Store Channel Mapping</h2>
                <span className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-full">Upload Successful</span>
              </div>
              <div className="p-4">
                <div className="border-l-4 border-green-400 bg-green-50 p-4 rounded">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-green-600 text-sm">📎</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">store_sales_channel_map....csv</div>
                      <div className="text-xs text-gray-600 mt-1">Uploaded on 01 Sept 2025, 10:57 pm by Test User</div>
                    </div>
                    <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded text-sm hover:bg-blue-50 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Last Success File
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-400 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Last Error File
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Last Run Config Data
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="font-semibold">AOP</h2>
                <span className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full">Upload failed</span>
              </div>
              <div className="p-4">
                <div className="border-l-4 border-red-400 bg-red-50 p-4 rounded">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-red-600 text-sm">📎</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">aop sales data update w....csv</div>
                      <div className="text-xs text-gray-600 mt-1">Uploaded on 15 Sept 2025, 06:35 pm by Test User</div>
                    </div>
                    <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded text-sm hover:bg-blue-50 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </div>
                  <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
                    <span className="text-red-800 text-sm">⚠️ File Upload Failed. Download Last Error File to check</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Last Success File
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm text-red-600 hover:bg-red-50 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Last Error File
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Last Run Config Data
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 bg-gray-800 rounded-full"></span>
                <span className="text-sm text-gray-700">No OTB calculation has been triggered yet</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Please upload all required files to Run OTB calculation</p>
              <button className="px-6 py-2 bg-blue-100 text-blue-400 rounded cursor-not-allowed">
                Run OTB Calculation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task 10: Bottom Confirmation Bar - Simplified */}
      {reviewMode && reviewChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-yellow-400 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Left Side - Info */}
            <div>
              <p className="font-medium text-gray-900">
                {Object.keys(reviewChanges.changes).length} KPIs will be updated upon confirmation
              </p>
            </div>
            
            {/* Right Side - Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDiscardChanges}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access Denied Toast Notification */}
      {showAccessDeniedToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              {/* Lock Icon */}
              <div className="flex-shrink-0">
                <span className="text-red-500 text-xl">🔒</span>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">
                  Edit Access Denied
                </h3>
                <p className="text-sm text-red-700">
                  Only Makers can edit this field.
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Your role: <span className="font-medium">{userRole}</span>
                </p>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowAccessDeniedToast(false)}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Toast Notification */}
      {showSavedToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              {/* Check Icon */}
              <div className="flex-shrink-0">
                <span className="text-green-500 text-xl">✓</span>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="font-semibold text-green-800">
                  Saved!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Your changes have been saved.
                </p>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowSavedToast(false)}
                className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning Dialog */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <span className="text-yellow-500 text-3xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Unsaved Changes
                  </h2>
                  <p className="text-gray-600">
                    You have unsaved changes. Do you want to save them before leaving?
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
              <button
                onClick={handleCancelNavigation}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedWithoutSaving}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSaveAndProceed}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Actions */}
      {showConfirmDialog && confirmDialogConfig && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseConfirmDialog}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Confirm Action
              </h2>
              <button
                onClick={handleCloseConfirmDialog}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                {confirmDialogConfig.message}
              </p>
              <p className="text-sm text-gray-600">
                OTB: <span className="font-medium">{confirmDialogConfig.otbName}</span>
              </p>
              
              {/* Disclaimer (only for approve action) */}
              {confirmDialogConfig.disclaimer && (
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Note: </span>
                    {confirmDialogConfig.disclaimer}
                  </p>
                </div>
              )}
            </div>

            {/* Footer with CTAs */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
              <button
                onClick={handleViewOTBFromDialog}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                {otbView === 'snapshot' ? 'View OTB' : 'Go Back'}
              </button>
              <button
                onClick={handleProceedAction}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <span className="text-green-500 text-xl">✓</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800">
                  Success!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  {successMessage}
                </p>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Context Menu for Comments */}
      {contextMenu.visible && (
        <div 
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-2 z-50 min-w-[180px]"
          style={{ 
            top: `${contextMenu.y}px`, 
            left: `${contextMenu.x}px` 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Add remark(s) */}
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors"
            onClick={handleAddRemarkClick}
          >
            <span>➕</span>
            <span>Add remark(s)</span>
          </button>
          
          {/* View remark(s) */}
          <button
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
              cellHasComments(contextMenu.cellId)
                ? 'hover:bg-gray-100 text-gray-900'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            onClick={() => cellHasComments(contextMenu.cellId) && handleViewRemarksClick()}
            disabled={!cellHasComments(contextMenu.cellId)}
          >
            <span>👁️</span>
            <span>View remark(s)</span>
          </button>
          
          {/* Remove remark(s) */}
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600 transition-colors"
            onClick={handleRemoveRemarksClick}
          >
            <span>🗑️</span>
            <span>Remove remark(s)</span>
          </button>
        </div>
      )}

      {/* Phase 4: Comment Modal */}
      {commentModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold">
                {commentModal.mode === 'add' ? 'Add Remark' : 'Edit Remark'}
              </h2>
              <button
                onClick={handleCommentCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content - Scrollable area */}
            <div className="p-4 overflow-y-auto flex-1">
              {/* Cell reference */}
              <div className="mb-3 text-sm text-gray-600">
                Cell: <span className="font-medium">{commentModal.cellLabel}</span>
              </div>
              
              {/* Task 1.2: Show editing indicator when in edit mode */}
              {commentModal.mode === 'edit' && (
                <div className="mb-3 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <span className="text-xs text-blue-800">✏️ Editing your comment</span>
                </div>
              )}
              
              {/* Task 1.3: Scrollable existing comments (max 2 visible, rest scroll) */}
              {commentModal.mode === 'add' && getCellComments(commentModal.cellId).length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Existing Comments:</div>
                  
                  {/* Scrollable container - shows 2 comments, scroll for more */}
                  <div className="max-h-[200px] overflow-y-auto mb-4 pr-2">
                    {getCellComments(commentModal.cellId).map(comment => (
                      <div key={comment.id} className="bg-gray-50 rounded p-3 mb-2">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                            <span className="text-xs text-gray-400">({comment.role})</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{comment.text}</p>
                        <div className="flex items-center justify-between mt-1">
                          {comment.edited && (
                            <span className="text-xs text-gray-500 italic">(edited {formatTimestamp(comment.editedAt)})</span>
                          )}
                          {/* Task 1.2: Edit/Delete buttons only for user's own comments from this session */}
                          {comment.sessionId === sessionId && (
                            <div className="flex gap-2 ml-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditComment(comment);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => handleDeleteComment(comment.id, e)}
                                className="text-xs text-red-600 hover:text-red-800 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <hr className="border-gray-300" />
                </div>
              )}
              
              {/* Task 1.1: Comment input with character limit */}
              <div className="mb-2">
                <textarea
                  ref={commentTextareaRef}
                  value={commentText}
                  onChange={(e) => {
                    // Enforce 250 character limit
                    if (e.target.value.length <= 250) {
                      setCommentText(e.target.value);
                    }
                  }}
                  placeholder="Enter your remark..."
                  className="w-full border border-gray-300 rounded p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  maxLength={250}
                  style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {currentUser.name} ({currentUser.role})
                  </span>
                  <span className={`text-xs ${commentText.length >= 250 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                    {commentText.length}/250
                  </span>
                </div>
              </div>
            </div>
            
            {/* Footer with CTAs */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                onClick={handleCommentCancel}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCommentSubmit}
                disabled={commentText.trim().length === 0}
                className={`px-4 py-2 rounded transition-colors ${
                  commentText.trim().length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {commentModal.mode === 'edit' ? 'Save' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task 2.1: Side Pane for Comments */}
      {sidePaneState.visible && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Remarks</h2>
            <button
              onClick={() => setSidePaneState({ ...sidePaneState, visible: false })}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - Grouped by cells */}
          <div className="flex-1 overflow-y-auto p-4">
            {Object.keys(getCommentsGroupedByCell()).length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl">💬</span>
                <p className="text-gray-500 text-sm mt-3">No remarks yet</p>
                <p className="text-gray-400 text-xs mt-1">Right-click any cell to add a remark</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(getCommentsGroupedByCell()).map(([cellId, data]) => (
                  <div key={cellId} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Cell Header - Collapsible */}
                    <button
                      onClick={() => toggleCellExpansion(cellId)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        {expandedCells[cellId] ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="text-sm font-medium text-gray-900">{data.cellLabel}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {data.comments.length}
                      </span>
                    </button>

                    {/* Comments List - Collapsible */}
                    {expandedCells[cellId] && (
                      <div className="p-3 space-y-3 bg-white">
                        {data.comments.map(comment => (
                          <div key={comment.id} className="border-l-2 border-blue-400 pl-3 py-2">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-900">{comment.author}</span>
                                <span className="text-xs text-gray-500">({comment.role})</span>
                              </div>
                              <span className="text-xs text-gray-400">{formatTimestamp(comment.timestamp)}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap break-words">{comment.text}</p>
                            
                            <div className="flex items-center justify-between">
                              {comment.edited && (
                                <span className="text-xs text-gray-400 italic">
                                  (edited {formatTimestamp(comment.editedAt)})
                                </span>
                              )}
                              
                              {/* Task 2.2: Edit/Delete buttons only for user's own comments */}
                              {comment.sessionId === sessionId && (
                                <div className="flex gap-2 ml-auto">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditComment(comment);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteComment(comment.id, e)}
                                    className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create OTB Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Create New OTB</h2>
              <button 
                onClick={handleCloseCreateDialog}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.versionName}
                  onChange={(e) => handleFormChange('versionName', e.target.value)}
                  placeholder="e.g., Q4_2025_V1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.hit}
                  onChange={(e) => handleFormChange('hit', e.target.value)}
                  placeholder="e.g., 10"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drop <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.drop}
                  onChange={(e) => handleFormChange('drop', e.target.value)}
                  placeholder="e.g., October"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={createFormData.year}
                  onChange={(e) => handleFormChange('year', e.target.value)}
                  placeholder="e.g., 2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={handleCloseCreateDialog}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOTBSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}